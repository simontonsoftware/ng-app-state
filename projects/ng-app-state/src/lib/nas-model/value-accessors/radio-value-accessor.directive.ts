import { Directive, Injector } from '@angular/core';
import { BaseInputValueAccessor } from './base-input-value-accessor';
import { makeProviderDef } from './base-value-accessor';

@Directive({
  selector: 'input[type=radio][nasModel]',
  providers: [makeProviderDef(RadioValueAccessorDirective)],
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
