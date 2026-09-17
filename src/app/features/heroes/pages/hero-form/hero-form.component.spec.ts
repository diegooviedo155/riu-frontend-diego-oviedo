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
    loadAll: ReturnType<typeof vi.fn>;
    heroes: ReturnType<typeof vi.fn>;
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
  const existingHeroes: Hero[] = [
    sampleHero,
    {
      id: '1',
      name: 'SPIDERMAN',
      alias: 'Peter Parker',
      power: 'Spider-Sense',
      publisher: 'Marvel',
    },
    {
      id: '2',
      name: 'CAPITÁN AMÉRICA',
      alias: 'Steve Rogers',
      power: 'Super Soldier',
      publisher: 'Marvel',
    },
  ];

  const createTestBed = async (
    routeId: string | null = null,
    heroesList: Hero[] = [],
  ) => {
    TestBed.resetTestingModule();

    facadeMock = {
      getHeroById: vi.fn(),
      createHero: vi.fn(),
      updateHero: vi.fn(),
      loadAll: vi.fn().mockReturnValue(of(heroesList)),
      heroes: vi.fn().mockReturnValue(heroesList),
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

  describe('Duplicate Name Validation', () => {
    it('should mark duplicateName error when creating hero with existing name (case-insensitive)', async () => {
      await createTestBed(null, existingHeroes);
      fixture.detectChanges();

      component.form.controls.name.setValue('spiderman');
      expect(component.form.controls.name.hasError('duplicateName')).toBe(true);

      component.form.controls.name.setValue('BATMAN');
      expect(component.form.controls.name.hasError('duplicateName')).toBe(
        false,
      );
    });

    it('should mark duplicateName error when creating hero with existing name differing in diacritics', async () => {
      await createTestBed(null, existingHeroes);
      fixture.detectChanges();

      component.form.controls.name.setValue('capitan america');
      expect(component.form.controls.name.hasError('duplicateName')).toBe(true);

      component.form.controls.name.setValue('Spíderman');
      expect(component.form.controls.name.hasError('duplicateName')).toBe(true);
    });

    it('should allow retaining own name in edit mode without duplicateName error', async () => {
      await createTestBed('10', existingHeroes);
      facadeMock.getHeroById.mockReturnValue(of(sampleHero));
      fixture.detectChanges();

      component.form.controls.name.setValue('THOR');
      expect(component.form.controls.name.hasError('duplicateName')).toBe(
        false,
      );
    });

    it('should prevent changing name to another hero name in edit mode', async () => {
      await createTestBed('10', existingHeroes);
      facadeMock.getHeroById.mockReturnValue(of(sampleHero));
      fixture.detectChanges();

      component.form.controls.name.setValue('SPIDERMAN');
      expect(component.form.controls.name.hasError('duplicateName')).toBe(true);
    });

    it('should display duplicate name error message in the DOM', async () => {
      await createTestBed(null, existingHeroes);
      fixture.detectChanges();

      component.form.controls.name.setValue('SPIDERMAN');
      component.form.controls.name.markAsTouched();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML).toContain(
        'Ya existe un héroe con este nombre',
      );
    });
  });
});
