import {
  AfterViewInit,
  Directive,
  Inject,
  Input,
  OnDestroy,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoreObject } from '../store-object';

@Directive({ selector: '[nasModel]' })
export class NasModelDirective<T> implements AfterViewInit, OnDestroy {
  private store!: StoreObject<T>;
  private subscription!: Subscription;
  private valueAccessor: ControlValueAccessor;

  constructor(
    @Self()
    @Inject(NG_VALUE_ACCESSOR)
    valueAccessors: ControlValueAccessor[],
  ) {
    this.valueAccessor = valueAccessors[0];
  }

  @Input()
  set nasModel(store: StoreObject<T>) {
    if (this.store?.refersToSameStateAs(this.store)) {
      console.warn(
        'nasModel was updated with a new store object that is equivalent to the old one. Cache the value bound to nasModel for better performance, e.g. using `StoreObject.withCaching()`.',
      );
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.store = store;
    this.subscription = store.$.subscribe((value) => {
      this.valueAccessor.writeValue(value);
    });
  }

  @Input()
  set disabled(isDisabled: boolean) {
    this.valueAccessor.setDisabledState?.(isDisabled);
  }

  ngAfterViewInit(): void {
    this.valueAccessor.registerOnChange((value: T) => {
      this.store.set(value);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
