import {
  Component,
  input,
  output,
  OnInit,
  DestroyRef,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  effect,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SEARCH_DEBOUNCE_TIME_MS } from '../../constants/hero.constants';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSearchComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly searchTerm = input<string>('');
  readonly searchChange = output<string>();
  readonly clear = output<void>();

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  constructor() {
    effect(() => {
      const term = this.searchTerm();
      if (this.searchControl.value !== term) {
        this.searchControl.setValue(term, { emitEvent: false });
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        tap(() => this.cdr.markForCheck()),
        debounceTime(SEARCH_DEBOUNCE_TIME_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.searchChange.emit(value);
      });
  }

  onClear(): void {
    this.searchControl.setValue('');
    this.cdr.markForCheck();
    this.clear.emit();
  }
}
