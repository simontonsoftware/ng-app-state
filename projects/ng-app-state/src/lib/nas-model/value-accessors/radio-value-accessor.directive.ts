import { Directive } from '@angular/core';
import { provideValueAccessor } from 's-ng-utils';
import { AbstractInputValueAccessorDirective } from './abstract-input-value-accessor.directive';

/** @hidden */
@Directive({
  selector: 'input[type=radio][nasModel]',
  providers: [provideValueAccessor(RadioValueAccessorDirective)],
})
export class RadioValueAccessorDirective extends AbstractInputValueAccessorDirective {
  writeValue(obj: any): void {
    // delay because `button.value` may not be set yet as the component is being initialized
    Promise.resolve().then(() => {
      this.element.checked = this.element.value === obj;
    });
  }
}
