import { Directive, forwardRef, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseInputValueAccessor } from './base-input-value-accessor';

@Directive({
  selector: 'input[type=range][nasModel]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouchedFn()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeValueAccessorDirective),
      multi: true,
    },
  ],
})
export class RangeValueAccessorDirective extends BaseInputValueAccessor {
  constructor(injector: Injector) {
    super(injector);
  }

  onChange(value: string) {
    this.onChangeFn(parseFloat(value));
  }
}
