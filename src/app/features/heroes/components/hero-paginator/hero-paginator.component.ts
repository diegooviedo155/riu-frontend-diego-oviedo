import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { HERO_PAGINATION_CONFIG } from '../../constants/hero.constants';

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
    if (startIndex >= safeLength) {
      const correctedPage = Math.max(0, Math.ceil(safeLength / pageSize) - 1);
      const safeStart = correctedPage * pageSize;
      const safeEnd = Math.min(safeStart + pageSize, safeLength);
      return `${safeStart + 1} – ${safeEnd} de ${safeLength}`;
    }
    const endIndex = Math.min(startIndex + pageSize, safeLength);
    return `${startIndex + 1} – ${endIndex} de ${safeLength}`;
  };
  return intl;
}

@Component({
  selector: 'app-hero-paginator',
  standalone: true,
  imports: [MatPaginatorModule],
  providers: [
    { provide: MatPaginatorIntl, useFactory: getSpanishPaginatorIntl },
  ],
  templateUrl: './hero-paginator.component.html',
  styleUrls: ['./hero-paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPaginatorComponent {
  readonly length = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageIndex = input.required<number>();
  readonly pageSizeOptions = input<readonly number[]>(
    HERO_PAGINATION_CONFIG.PAGE_SIZE_OPTIONS,
  );
  readonly pageChange = output<PageEvent>();
}
