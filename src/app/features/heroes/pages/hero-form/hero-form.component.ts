import {
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeroFacadeService } from '../../services/hero-facade.service';
import { Hero, PublisherType } from '../../models';
import { UppercaseDirective } from '../../../../shared/directives/uppercase.directive';
import { HERO_ROUTES } from '../../constants/hero.constants';
import { normalizeHeroText } from '../../utils/hero.utils';

export function uniqueHeroNameValidator(
  heroesProvider: () => Hero[],
  currentHeroId?: () => string | null,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') {
      return null;
    }
    const normalized = normalizeHeroText(value);
    if (!normalized) {
      return null;
    }
    const currentId = currentHeroId ? currentHeroId() : null;
    const heroes = heroesProvider() ?? [];
    const isDuplicate = heroes.some((hero) => {
      if (currentId && hero.id === currentId) {
        return false;
      }
      return normalizeHeroText(hero.name) === normalized;
    });

    return isDuplicate ? { duplicateName: true } : null;
  };
}

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    UppercaseDirective,
  ],
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(HeroFacadeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEditMode = signal<boolean>(false);
  private heroId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        uniqueHeroNameValidator(
          () => this.facade.heroes(),
          () => this.heroId,
        ),
      ],
    ],
    alias: ['', [Validators.required]],
    power: ['', [Validators.required]],
    publisher: ['Marvel' as PublisherType, [Validators.required]],
    description: [''],
  });

  ngOnInit(): void {
    this.heroId = this.route.snapshot.paramMap.get('id');
    if (this.facade.heroes().length === 0) {
      this.facade
        .loadAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
    if (this.heroId) {
      this.isEditMode.set(true);
      this.populateFormData(this.heroId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();

    if (this.isEditMode() && this.heroId) {
      this.facade
        .updateHero(this.heroId, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.navigateBack();
        });
    } else {
      this.facade
        .createHero(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.navigateBack();
        });
    }
  }

  private populateFormData(id: string): void {
    this.facade
      .getHeroById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (hero) => {
          this.form.patchValue({
            name: hero.name,
            alias: hero.alias,
            power: hero.power,
            publisher: hero.publisher ?? 'Marvel',
            description: hero.description ?? '',
          });
        },
        error: () => this.navigateBack(),
      });
  }

  private navigateBack(): void {
    this.router.navigate([HERO_ROUTES.HEROES]);
  }
}
