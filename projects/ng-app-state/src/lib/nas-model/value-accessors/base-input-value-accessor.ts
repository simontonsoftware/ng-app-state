import { HostListener } from "@angular/core";
import { BaseValueAccessor } from "./base-value-accessor";

/** @hidden */
export abstract class BaseInputValueAccessor extends BaseValueAccessor<
  HTMLInputElement
> {
  @HostListener("change")
  @HostListener("input")
  onChange() {
    this.onChangeFn(this.element.value);
  }

  @HostListener("blur")
  onBlur() {
    this.onTouchedFn();
  }

  writeValue(value: any) {
    this.element.value = value;
  }

  setDisabledState(isDisabled: boolean) {
    this.element.disabled = isDisabled;
  }
}
