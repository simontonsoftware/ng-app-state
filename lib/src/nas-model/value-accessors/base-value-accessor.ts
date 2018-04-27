import { ElementRef, Injector } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export abstract class BaseValueAccessor<T extends HTMLElement>
  implements ControlValueAccessor {
  onChangeFn: (value: any) => void;

  private elementRef: ElementRef;

  onTouchedFn = () => {};

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
