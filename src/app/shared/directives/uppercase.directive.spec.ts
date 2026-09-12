import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';
import { UppercaseDirective } from './uppercase.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UppercaseDirective],
  template: `
    <input
      id="controlled-input"
      type="text"
      [formControl]="control"
      appUppercase
    />
    <input id="uncontrolled-input" type="text" appUppercase />
  `,
})
class TestHostComponent {
  control = new FormControl('');
}

describe('UppercaseDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let controlledInput: HTMLInputElement;
  let uncontrolledInput: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    controlledInput = fixture.nativeElement.querySelector('#controlled-input');
    uncontrolledInput = fixture.nativeElement.querySelector(
      '#uncontrolled-input',
    );
  });

  describe('Happy Path', () => {
    it('should transform typed text to uppercase in input element and FormControl', () => {
      controlledInput.value = 'spiderman';

      controlledInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(controlledInput.value).toBe('SPIDERMAN');
      expect(fixture.componentInstance.control.value).toBe('SPIDERMAN');
    });

    it('should transform typed text on input element without ngControl attached', () => {
      uncontrolledInput.value = 'superman';

      uncontrolledInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(uncontrolledInput.value).toBe('SUPERMAN');
    });
  });

  describe('Bad Path', () => {
    it('should maintain consistent empty state when input value is empty string', () => {
      controlledInput.value = '';

      controlledInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(controlledInput.value).toBe('');
      expect(fixture.componentInstance.control.value).toBe('');
    });
  });

  describe('Border Cases', () => {
    it('should leave already uppercase text unchanged', () => {
      controlledInput.value = 'BATMAN';

      controlledInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(controlledInput.value).toBe('BATMAN');
      expect(fixture.componentInstance.control.value).toBe('BATMAN');
    });

    it('should preserve spaces, numbers and special characters while uppercasing letters', () => {
      controlledInput.value = 'agent 007 - mi6';

      controlledInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(controlledInput.value).toBe('AGENT 007 - MI6');
      expect(fixture.componentInstance.control.value).toBe('AGENT 007 - MI6');
    });
  });
});
