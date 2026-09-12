import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  DestroyRef,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
export class HeroSearchComponent implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() searchTerm = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  ngOnInit(): void {
    this.searchControl.setValue(this.searchTerm, { emitEvent: false });
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] && !changes['searchTerm'].firstChange) {
      if (this.searchControl.value !== this.searchTerm) {
        this.searchControl.setValue(this.searchTerm, { emitEvent: false });
        this.cdr.markForCheck();
      }
    }
  }

  onClear(): void {
    this.searchControl.setValue('');
    this.cdr.markForCheck();
    this.clear.emit();
  }
}
