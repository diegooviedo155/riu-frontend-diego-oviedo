import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HeroFacadeService } from '../../services/hero-facade.service';
import { Hero } from '../../models';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { cardStaggerAnimation } from '../../../../shared/animations/list.animations';
import { HERO_PAGINATION_CONFIG } from '../../constants/hero.constants';
import { HeroCardComponent } from '../../components/hero-card/hero-card.component';
import { HeroSearchComponent } from '../../components/hero-search/hero-search.component';

export function getSpanishPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Héroes por página:';
  intl.nextPageLabel = 'Página siguiente';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primera página';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (
    page: number,
    pageSize: number,
    length: number,
  ): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    const safeLength = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < safeLength
        ? Math.min(startIndex + pageSize, safeLength)
        : startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} de ${safeLength}`;
  };
  return intl;
}

@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [
    RouterLink,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    HeroCardComponent,
    HeroSearchComponent,
  ],
  providers: [
    { provide: MatPaginatorIntl, useFactory: getSpanishPaginatorIntl },
  ],
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
  animations: [cardStaggerAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroListComponent implements OnInit {
  private readonly facade = inject(HeroFacadeService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = signal<number>(HERO_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  readonly pageIndex = signal<number>(0);
  readonly pageSizeOptions = HERO_PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;

  readonly searchTerm = this.facade.searchTerm;
  readonly filteredHeroes = this.facade.filteredHeroes;

  readonly paginatedHeroes = computed(() => {
    const list = this.filteredHeroes();
    const total = list.length;
    const size = this.pageSize();
    const maxPage = Math.max(0, Math.ceil(total / size) - 1);
    const currentPage = Math.min(this.pageIndex(), maxPage);
    const start = currentPage * size;
    return list.slice(start, start + size);
  });

  ngOnInit(): void {
    this.facade.loadAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onSearchChange(term: string): void {
    this.facade.setSearchTerm(term);
    this.pageIndex.set(0);
  }

  onSearchClear(): void {
    this.facade.setSearchTerm('');
    this.pageIndex.set(0);
  }

  onEditHero(id: string): void {
    this.router.navigate(['/heroes/edit', id]);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  confirmDelete(hero: Hero): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: '¿Eliminar superhéroe?',
        message: `Esta acción no se puede deshacer. Se eliminará definitivamente a ${hero.name}.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.facade.deleteHero(hero.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
