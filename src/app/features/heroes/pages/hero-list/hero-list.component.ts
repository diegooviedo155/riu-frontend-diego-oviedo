import {
  Component,
  OnInit,
  inject,
  computed,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeroFacadeService } from '../../services/hero-facade.service';
import { Hero } from '../../models';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { cardStaggerAnimation } from '../../../../shared/animations/list.animations';
import { HeroCardComponent } from '../../components/hero-card/hero-card.component';
import { HeroSearchComponent } from '../../components/hero-search/hero-search.component';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { HeroPaginatorComponent } from '../../components/hero-paginator/hero-paginator.component';

@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    HeroCardComponent,
    HeroSearchComponent,
    HeroBannerComponent,
    HeroPaginatorComponent,
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

  readonly pageSize = this.facade.pageSize;
  readonly pageIndex = this.facade.pageIndex;
  readonly searchTerm = this.facade.searchTerm;
  readonly filteredHeroes = this.facade.filteredHeroes;
  readonly isLoading = this.facade.isLoading;

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
    this.facade
      .searchHeroes(term)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onSearchClear(): void {
    this.facade
      .searchHeroes('')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onEditHero(id: string): void {
    this.router.navigate(['/heroes/edit', id]);
  }

  onPageChange(event: PageEvent): void {
    this.facade.setPageSize(event.pageSize);
    this.facade.setPageIndex(event.pageIndex);
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
