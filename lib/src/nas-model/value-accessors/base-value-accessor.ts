import { ElementRef, Injector } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export abstract class BaseValueAccessor<T extends HTMLElement>
  implements ControlValueAccessor {
  onChangeFn: (_: any) => void;
  onTouchedFn: () => void;

  private elementRef: ElementRef;

  constructor(injector: Injector) {
    this.elementRef = injector.get(ElementRef);
  }

  abstract writeValue(obj: any): void;

  registerOnChange(fn: (_: any) => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouchedFn = fn;
  }

  protected get element() {
    return this.elementRef.nativeElement as T;
  }
}
