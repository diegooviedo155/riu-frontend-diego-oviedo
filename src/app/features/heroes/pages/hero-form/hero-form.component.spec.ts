import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeroFormComponent } from './hero-form.component';
import { HeroFacadeService } from '../../services/hero-facade.service';
import { Hero } from '../../models';

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;
  let facadeMock: {
    getHeroById: ReturnType<typeof vi.fn>;
    createHero: ReturnType<typeof vi.fn>;
    updateHero: ReturnType<typeof vi.fn>;
  };
  let router: Router;
  let activatedRouteMock: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };

  const sampleHero: Hero = {
    id: '10',
    name: 'THOR',
    alias: 'Thor Odinson',
    power: 'God of Thunder',
    publisher: 'Marvel',
    description: 'Asgardian hero',
  };

  const createTestBed = async (routeId: string | null = null) => {
    TestBed.resetTestingModule();

    facadeMock = {
      getHeroById: vi.fn(),
      createHero: vi.fn(),
      updateHero: vi.fn(),
    };

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue(routeId),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: HeroFacadeService, useValue: facadeMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
  };

  describe('Happy Path', () => {
    beforeEach(async () => {
      await createTestBed(null);
      fixture.detectChanges();
    });

    it('should create component in creation mode when route has no id', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode()).toBe(false);
      expect(component.form.valid).toBe(false);
    });

    it('should submit valid form in create mode and navigate back', () => {
      facadeMock.createHero.mockReturnValue(of(sampleHero));

      component.form.setValue({
        name: 'THOR',
        alias: 'Thor Odinson',
        power: 'God of Thunder',
        publisher: 'Marvel',
        description: 'Asgardian hero',
      });
      component.onSubmit();

      expect(facadeMock.createHero).toHaveBeenCalledWith({
        name: 'THOR',
        alias: 'Thor Odinson',
        power: 'God of Thunder',
        publisher: 'Marvel',
        description: 'Asgardian hero',
      });
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });

    it('should submit valid form in edit mode and navigate back', async () => {
      await createTestBed('10');
      facadeMock.getHeroById.mockReturnValue(of(sampleHero));
      facadeMock.updateHero.mockReturnValue(of(sampleHero));
      fixture.detectChanges();

      component.form.patchValue({ alias: 'Lord of Thunder' });
      component.onSubmit();

      expect(facadeMock.updateHero).toHaveBeenCalledWith(
        '10',
        component.form.getRawValue(),
      );
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('Bad Path', () => {
    beforeEach(async () => {
      await createTestBed(null);
      fixture.detectChanges();
    });

    it('should mark all controls as touched and block submit when form is invalid', () => {
      component.onSubmit();

      expect(component.form.controls.name.touched).toBe(true);
      expect(component.form.controls.alias.touched).toBe(true);
      expect(component.form.controls.power.touched).toBe(true);
      expect(facadeMock.createHero).not.toHaveBeenCalled();
    });

    it('should navigate back to heroes list when getHeroById fails with 404', async () => {
      await createTestBed('999');
      facadeMock.getHeroById.mockReturnValue(
        throwError(() => new Error('Not found')),
      );

      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('Border Cases', () => {
    beforeEach(async () => {
      await createTestBed(null);
      fixture.detectChanges();
    });

    it('should enforce minlength of 3 characters on name field', () => {
      const nameControl = component.form.controls.name;

      nameControl.setValue('A');
      expect(nameControl.hasError('minlength')).toBe(true);

      nameControl.setValue('AB');
      expect(nameControl.hasError('minlength')).toBe(true);

      nameControl.setValue('ABC');
      expect(nameControl.hasError('minlength')).toBe(false);
    });

    it('should fallback to Marvel and empty string when populating hero without optionals in edit mode', async () => {
      await createTestBed('11');
      const heroWithoutOptionals: Hero = {
        id: '11',
        name: 'HAWKEYE',
        alias: 'Clint Barton',
        power: 'Archery',
      };
      facadeMock.getHeroById.mockReturnValue(of(heroWithoutOptionals));

      fixture.detectChanges();

      expect(component.form.value.publisher).toBe('Marvel');
      expect(component.form.value.description).toBe('');
    });
  });
});
