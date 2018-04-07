import { Directive, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[type=radio][nasModel]',
  host: {
    '(change)': 'onChange()',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NasRadioAdapterDirective),
      multi: true,
    },
  ],
})
export class NasRadioAdapterDirective implements ControlValueAccessor {
  onChange = () => {};
  onTouched = () => {};

  constructor(private elementRef: ElementRef) {}

  registerOnChange(fn: any): void {
    this.onChange = () => {
      fn(this.button.value);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.button.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.button.checked = this.button.value === obj;
  }

  private get button() {
    return this.elementRef.nativeElement as HTMLInputElement;
  }
}
