import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.isLoading()) {
      <aside class="spinner-container" aria-label="Cargando contenido">
        <mat-progress-bar
          mode="indeterminate"
          color="primary"
        ></mat-progress-bar>
      </aside>
    }
  `,
  styles: [
    `
      .spinner-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 9999;
      }
    `,
  ],
})
export class SpinnerComponent {
  readonly loadingService = inject(LoadingService);
}
