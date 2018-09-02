import { Directive, Injector } from "@angular/core";
import { isNil } from "micro-dash";
import { BaseInputValueAccessor } from "./base-input-value-accessor";
import { makeProviderDef } from "./base-value-accessor";

/** @private */
@Directive({
  selector: "input[type=number][nasModel]",
  providers: [makeProviderDef(NumberValueAccessorDirective)],
})
export class NumberValueAccessorDirective extends BaseInputValueAccessor {
  constructor(injector: Injector) {
    super(injector);
  }

  registerOnChange(fn: (value: number | null) => void) {
    this.onChangeFn = (value: string) => {
      fn(value === "" ? null : parseFloat(value));
    };
  }

  writeValue(value: number): void {
    // The value needs to be normalized for IE9, otherwise it is set to 'null' when null
    this.element.value = isNil(value) ? "" : value.toString();
  }
}
