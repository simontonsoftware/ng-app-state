import { ElementRef, Injector, Provider, Type } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { noop } from "micro-dash";

/** @hidden */
export function makeProviderDef(type: Type<BaseValueAccessor<any>>): Provider {
  return { provide: NG_VALUE_ACCESSOR, useExisting: type, multi: true };
}

/** @hidden */
export abstract class BaseValueAccessor<T extends HTMLElement>
  implements ControlValueAccessor {
  onChangeFn!: (value: any) => void;
  onTouchedFn = noop;

  private elementRef: ElementRef;

  constructor(injector: Injector) {
    this.elementRef = injector.get(ElementRef);
  }

  abstract writeValue(value: any): void;

  registerOnChange(fn: (value: any) => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouchedFn = fn;
  }

  protected get element() {
    return this.elementRef.nativeElement as T;
  }
}
