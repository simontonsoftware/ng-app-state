import { Directive, forwardRef, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseInputValueAccessor } from './base-input-value-accessor';

@Directive({
  selector: 'input[type=radio][nasModel]',
  host: {
    '(change)': 'onChangeFn($event.target.value)',
    '(blur)': 'onTouchedFn()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioValueAccessorDirective),
      multi: true,
    },
  ],
})
export class RadioValueAccessorDirective extends BaseInputValueAccessor {
  constructor(injector: Injector) {
    super(injector);
  }

  writeValue(obj: any): void {
    // delay because as the component is being initialized `button.value` might not be set yet
    Promise.resolve().then(() => {
      this.element.checked = this.element.value === obj;
    });
  }
}
