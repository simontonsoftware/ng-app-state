import { Directive, ElementRef, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[type=radio][nasModel]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioValueAccessorDirective),
      multi: true,
    },
  ],
})
export class RadioValueAccessorDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private elementRef: ElementRef) {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.button.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    // delay because as the component is being initialized `button.value` might not be set yet
    Promise.resolve().then(() => {
      this.button.checked = this.button.value === obj;
    });
  }

  private get button() {
    return this.elementRef.nativeElement as HTMLInputElement;
  }
}
