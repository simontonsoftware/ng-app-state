import { Directive } from "@angular/core";
import { provideValueAccessor } from "s-ng-utils";
import { AbstractInputValueAccessorDirective } from "./abstract-input-value-accessor.directive";

/** @hidden */
@Directive({
  selector: "input[type=range][nasModel]",
  providers: [provideValueAccessor(RangeValueAccessorDirective)],
})
export class RangeValueAccessorDirective extends AbstractInputValueAccessorDirective {
  registerOnChange(fn: (value: number) => void) {
    this.onChangeFn = (value: string) => {
      fn(parseFloat(value));
    };
  }
}
