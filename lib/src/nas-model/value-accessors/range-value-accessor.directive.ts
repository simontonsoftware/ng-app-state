import { Directive, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isNil } from 'micro-dash';

@Directive({
  selector: 'input[type=range][nasModel]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeValueAccessorDirective),
      multi: true,
    },
  ],
})
export class RangeValueAccessorDirective implements ControlValueAccessor {
  onChange: (_: any) => void;
  onTouched: () => void;

  constructor(private elementRef: ElementRef) {}

  writeValue(obj: any): void {
    this.range.value = obj;
  }

  registerOnChange(fn: (_: number | null) => void): void {
    this.onChange = (value) => {
      fn(parseFloat(value));
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.range.disabled = isDisabled;
  }

  private get range() {
    return this.elementRef.nativeElement as HTMLInputElement;
  }
}
