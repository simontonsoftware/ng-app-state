import { BaseValueAccessor } from './base-value-accessor';

export class BaseInputValueAccessor extends BaseValueAccessor<
  HTMLInputElement
> {
  writeValue(value: any) {
    this.element.value = value;
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.disabled = isDisabled;
  }
}
