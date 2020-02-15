import { Directive } from "@angular/core";
import { provideValueAccessor } from "s-ng-utils";
import { BaseInputValueAccessor } from "./base-input-value-accessor";

/** @hidden */
@Directive({
  selector: "input[type=radio][nasModel]",
  providers: [provideValueAccessor(RadioValueAccessorDirective)],
})
export class RadioValueAccessorDirective extends BaseInputValueAccessor {
  writeValue(obj: any): void {
    // delay because as the component is being initialized `button.value` might not be set yet
    Promise.resolve().then(() => {
      this.element.checked = this.element.value === obj;
    });
  }
}
