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
      useExisting: forwardRef(() => NasRangeAdapterDirective),
      multi: true,
    },
  ],
})
export class NasRangeAdapterDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private elementRef: ElementRef) {}

  registerOnChange(fn: (_: number | null) => void): void {
    this.onChange = (value) => {
      fn(isNil(value) ? parseFloat(value) : null);
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.range.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.range.value = obj;
  }

  private get range() {
    return this.elementRef.nativeElement as HTMLInputElement;
  }
}
