import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirm-dialog-wrapper">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon class="dialog-title-icon" aria-hidden="true"
          >warning_amber</mat-icon
        >
        <span>{{ data.title }}</span>
      </h2>
      <mat-dialog-content>
        <p class="dialog-message">{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="dismiss()">
          <mat-icon aria-hidden="true">close</mat-icon>
          <span>{{ data.cancelText || 'Cancelar' }}</span>
        </button>
        <button
          mat-flat-button
          class="danger-btn"
          type="button"
          (click)="confirm()"
        >
          <mat-icon aria-hidden="true">delete</mat-icon>
          <span>{{ data.confirmText || 'Eliminar' }}</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .confirm-dialog-wrapper {
        padding: 16px;
      }
      .dialog-title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1c1c1c;
        margin-bottom: 8px;
      }
      .dialog-title-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: #c4002e;
      }
      .dialog-message {
        color: #666666;
        font-size: 0.95rem;
        line-height: 1.5;
      }
      .dialog-actions {
        padding-top: 16px;
        gap: 8px;

        button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 8px;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
        button.danger-btn {
          --mdc-filled-button-container-color: #c4002e;
          --mdc-filled-button-label-text-color: #ffffff;
          background-color: #c4002e;
          color: #ffffff;
          border-radius: 8px;
          transition: background-color 0.15s ease;

          &:hover {
            --mdc-filled-button-container-color: #9e0024;
            background-color: #9e0024;
          }

          &:active {
            --mdc-filled-button-container-color: #85001e;
            background-color: #85001e;
          }
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }

  dismiss(): void {
    this.dialogRef.close(false);
  }
}
