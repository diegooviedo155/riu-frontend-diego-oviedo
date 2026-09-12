import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeroCardComponent } from './hero-card.component';
import { Hero } from '../../models';

describe('HeroCardComponent', () => {
  let component: HeroCardComponent;
  let fixture: ComponentFixture<HeroCardComponent>;

  const mockHero: Hero = {
    id: '1',
    name: 'SPIDERMAN',
    alias: 'Peter Parker',
    power: 'Spider-Sense',
    publisher: 'Marvel',
    description: 'Bitten by a radioactive spider',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('hero', mockHero);
    fixture.detectChanges();
  });

  describe('Happy Path', () => {
    it('should create component and render hero information', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(component).toBeTruthy();
      expect(compiled.querySelector('.hero-card__name')?.textContent).toContain(
        'SPIDERMAN',
      );
      expect(
        compiled.querySelector('.hero-card__alias')?.textContent,
      ).toContain('Peter Parker');
      expect(
        compiled.querySelector('.hero-card__power')?.textContent,
      ).toContain('Spider-Sense');
      expect(
        compiled.querySelector('.hero-card__power-icon')?.textContent,
      ).toContain('bolt');
      expect(
        compiled.querySelector('.hero-card__publisher')?.textContent,
      ).toContain('Marvel');
      expect(
        compiled.querySelector('.hero-card__description')?.textContent,
      ).toContain('Bitten by a radioactive spider');
      expect(
        compiled.querySelector('.hero-card__avatar')?.textContent?.trim(),
      ).toBe('S');
      expect(compiled.querySelector('.hero-card__trigger')).toBeTruthy();
    });

    it('should emit edit event with hero id when edit button is clicked', () => {
      const editSpy = vi.spyOn(component.edit, 'emit');
      const compiled = fixture.nativeElement as HTMLElement;
      const editButton = compiled.querySelectorAll<HTMLButtonElement>(
        '.hero-card__action-btn',
      )[0];

      editButton.click();

      expect(editSpy).toHaveBeenCalledWith('1');
    });

    it('should emit delete event with hero object when delete button is clicked', () => {
      const deleteSpy = vi.spyOn(component.delete, 'emit');
      const compiled = fixture.nativeElement as HTMLElement;
      const deleteButton = compiled.querySelector<HTMLButtonElement>(
        '.hero-card__action-btn--delete',
      );

      deleteButton?.click();

      expect(deleteSpy).toHaveBeenCalledWith(mockHero);
    });
  });

  describe('Bad Path', () => {
    it('should not emit edit when onEdit is not triggered', () => {
      const editSpy = vi.spyOn(component.edit, 'emit');

      expect(editSpy).not.toHaveBeenCalled();
    });

    it('should not emit delete when onDelete is not triggered', () => {
      const deleteSpy = vi.spyOn(component.delete, 'emit');

      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('Border Cases', () => {
    it('should fallback to default publisher text when publisher is undefined', () => {
      const heroWithoutPublisher: Hero = {
        id: '2',
        name: 'UNKNOWN',
        alias: 'Unknown Alias',
        power: 'Invisibility',
      };
      fixture.componentRef.setInput('hero', heroWithoutPublisher);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const publisherEl = compiled.querySelector('.hero-card__publisher');

      expect(publisherEl?.textContent).toContain('Hero');
    });

    it('should not render description element when description is undefined', () => {
      const heroWithoutDescription: Hero = {
        id: '3',
        name: 'HERO',
        alias: 'Hero Alias',
        power: 'Flight',
        description: undefined,
      };
      fixture.componentRef.setInput('hero', heroWithoutDescription);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const descEl = compiled.querySelector('.hero-card__description');

      expect(descEl).toBeNull();
    });

    it('should not render description element when description is empty', () => {
      const heroWithEmptyDescription: Hero = {
        id: '4',
        name: 'HERO',
        alias: 'Hero Alias',
        power: 'Flight',
        description: '',
      };
      fixture.componentRef.setInput('hero', heroWithEmptyDescription);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const descEl = compiled.querySelector('.hero-card__description');

      expect(descEl).toBeNull();
    });

    it('should render power icon with bolt text in power badge', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const powerIcon = compiled.querySelector('.hero-card__power-icon');

      expect(powerIcon).toBeTruthy();
      expect(powerIcon?.textContent?.trim()).toBe('bolt');
    });

    it('should render fallback avatar letter H when name is empty', () => {
      const heroWithEmptyName: Hero = {
        id: '5',
        name: '',
        alias: 'Empty Name Alias',
        power: 'Invisibility',
      };
      fixture.componentRef.setInput('hero', heroWithEmptyName);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const avatarEl = compiled.querySelector('.hero-card__avatar');

      expect(avatarEl?.textContent?.trim()).toBe('H');
    });
  });
});
