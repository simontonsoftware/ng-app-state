import { Directive, Injector } from '@angular/core';
import { BaseInputValueAccessor } from './base-input-value-accessor';
import { makeProviderDef } from './base-value-accessor';

@Directive({
  selector: 'input[type=range][nasModel]',
  providers: [makeProviderDef(RangeValueAccessorDirective)],
})
export class RangeValueAccessorDirective extends BaseInputValueAccessor {
  constructor(injector: Injector) {
    super(injector);
  }

  registerOnChange(fn: (value: number) => void) {
    this.onChangeFn = (value: string) => {
      fn(parseFloat(value));
    };
  }
}
