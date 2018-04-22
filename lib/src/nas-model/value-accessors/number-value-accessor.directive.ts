import { Directive, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isNil } from 'micro-dash';

@Directive({
  selector: 'input[type=number][nasModel]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberValueAccessorDirective),
      multi: true,
    },
  ],
})
export class NumberValueAccessorDirective implements ControlValueAccessor {
  onChange: (_: any) => void;
  onTouched: () => void;

  constructor(private elementRef: ElementRef) {}

  writeValue(value: number): void {
    // The value needs to be normalized for IE9, otherwise it is set to 'null' when null
    this.input.value = isNil(value) ? '' : value.toString();
  }

  registerOnChange(fn: (_: number | null) => void): void {
    this.onChange = (value) => {
      fn(value === '' ? null : parseFloat(value));
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.input.disabled = isDisabled;
  }

  private get input() {
    return this.elementRef.nativeElement as HTMLInputElement;
  }
}
