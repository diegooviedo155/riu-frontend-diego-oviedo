import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SpinnerComponent } from './spinner.component';
import { LoadingService } from '../../../core/services/loading.service';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [LoadingService],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService);
    fixture.detectChanges();
  });

  describe('Happy Path', () => {
    it('should create spinner component', () => {
      expect(component).toBeTruthy();
    });

    it('should render progress bar when loading service is active', () => {
      loadingService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinner = compiled.querySelector('.spinner-container');

      expect(spinner).not.toBeNull();
    });
  });

  describe('Bad Path', () => {
    it('should not render progress bar when loading service is inactive', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const spinner = compiled.querySelector('.spinner-container');

      expect(spinner).toBeNull();
    });
  });
});
