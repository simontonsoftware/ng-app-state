import { Directive } from "@angular/core";
import { provideValueAccessor } from "s-ng-utils";
import { BaseInputValueAccessor } from "./base-input-value-accessor";

/** @hidden */
@Directive({
  selector: "input[type=range][nasModel]",
  providers: [provideValueAccessor(RangeValueAccessorDirective)],
})
export class RangeValueAccessorDirective extends BaseInputValueAccessor {
  registerOnChange(fn: (value: number) => void) {
    this.onChangeFn = (value: string) => {
      fn(parseFloat(value));
    };
  }
}
