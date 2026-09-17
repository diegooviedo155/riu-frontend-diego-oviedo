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
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    const originalValue = inputElement.value;
    const transformedValue = originalValue.toUpperCase();

    if (originalValue !== transformedValue) {
      inputElement.value = transformedValue;
      if (start !== null && end !== null) {
        inputElement.setSelectionRange(start, end);
      }
    }

    if (
      this.ngControl?.control &&
      this.ngControl.control.value !== transformedValue
    ) {
      this.ngControl.control.setValue(transformedValue, { emitEvent: false });
    }
  }
}
