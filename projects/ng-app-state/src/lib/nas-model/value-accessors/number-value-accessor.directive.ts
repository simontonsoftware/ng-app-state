import { Directive, forwardRef, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { isNil } from 'micro-dash';
import { BaseInputValueAccessor } from './base-input-value-accessor';

@Directive({
  selector: 'input[type=number][nasModel]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberValueAccessorDirective),
      multi: true,
    },
  ],
})
export class NumberValueAccessorDirective extends BaseInputValueAccessor {
  constructor(injector: Injector) {
    super(injector);
  }

  registerOnChange(fn: (value: number | null) => void) {
    this.onChangeFn = (value: string) => {
      fn(value === '' ? null : parseFloat(value));
    };
  }

  writeValue(value: number): void {
    // The value needs to be normalized for IE9, otherwise it is set to 'null' when null
    this.element.value = isNil(value) ? '' : value.toString();
  }
}
