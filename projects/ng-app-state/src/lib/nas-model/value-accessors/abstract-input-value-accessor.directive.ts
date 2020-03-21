import { Directive, HostListener } from "@angular/core";
import { AbstractValueAccessorDirective } from "./abstract-value-accessor.directive";

/** @hidden */
@Directive()
export abstract class AbstractInputValueAccessorDirective extends AbstractValueAccessorDirective<
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
