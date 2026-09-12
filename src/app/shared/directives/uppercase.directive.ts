import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const transformedValue = inputElement.value.toUpperCase();

    inputElement.value = transformedValue;

    if (this.ngControl?.control) {
      this.ngControl.control.setValue(transformedValue, { emitEvent: false });
    }
  }
}
