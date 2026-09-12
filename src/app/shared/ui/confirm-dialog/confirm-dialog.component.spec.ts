import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const dialogData: ConfirmDialogData = {
    title: 'Delete Hero',
    message: 'Are you sure you want to delete this hero?',
    confirmText: 'Yes, Delete',
    cancelText: 'No, Keep',
  };

  const createComponentWithData = async (data: ConfirmDialogData) => {
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Happy Path', () => {
    beforeEach(async () => {
      await createComponentWithData(dialogData);
    });

    it('should create component and render provided dialog title and message', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(component).toBeTruthy();
      expect(compiled.querySelector('.dialog-title')?.textContent).toContain(
        'Delete Hero',
      );
      expect(compiled.querySelector('.dialog-message')?.textContent).toContain(
        'Are you sure you want to delete this hero?',
      );
    });

    it('should close dialog with true when confirm button is invoked', () => {
      component.confirm();

      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });
  });

  describe('Bad Path', () => {
    beforeEach(async () => {
      await createComponentWithData(dialogData);
    });

    it('should close dialog with false when dismiss is invoked', () => {
      component.dismiss();

      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Border Cases', () => {
    it('should render fallback labels when confirmText and cancelText are omitted', async () => {
      await createComponentWithData({
        title: 'Simple Title',
        message: 'Simple Message',
      });

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');

      expect(buttons[0].textContent).toContain('Cancelar');
      expect(buttons[1].textContent).toContain('Eliminar');
    });

    it('should handle empty message string gracefully', async () => {
      await createComponentWithData({
        title: 'Empty Message Title',
        message: '',
      });

      const compiled = fixture.nativeElement as HTMLElement;
      const messageEl = compiled.querySelector('.dialog-message');

      expect(messageEl?.textContent).toBe('');
    });
  });
});
