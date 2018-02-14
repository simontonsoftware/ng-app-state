import {
  AfterViewInit,
  Directive,
  Inject,
  Input,
  OnDestroy,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { StoreObject } from '../store-object';

/**
 *
 */
@Directive({ selector: '[nasModel]' })
export class NasModelDirective<T> implements AfterViewInit, OnDestroy {
  private store: StoreObject<T>;
  private subscription: Subscription;
  private valueAccessor: ControlValueAccessor;

  constructor(
    @Self()
    @Inject(NG_VALUE_ACCESSOR)
    valueAccessors: ControlValueAccessor[],
  ) {
    this.valueAccessor = valueAccessors[0];
  }

  @Input()
  public set nasModel(store: StoreObject<T>) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.store = store;
    this.subscription = store.$.subscribe((value) => {
      this.valueAccessor.writeValue(value);
    });
  }

  public ngAfterViewInit() {
    this.valueAccessor.registerOnChange((value: T) => {
      this.store.set(value);
    });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
