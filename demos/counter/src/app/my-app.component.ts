import { Component } from '@angular/core';
import { StoreObject } from 'ng-app-state';
import { CounterStore } from './counter-store';

@Component({
  selector: 'my-app',
  template: `
    <button (click)="increment()">Increment</button>
    <div>Current Count: {{ valueStore.$ | async }}</div>
    <button (click)="decrement()">Decrement</button>

    <button (click)="reset()">Reset Counter</button>
  `,
})
export class MyAppComponent {
  valueStore: StoreObject<number>;

  constructor(store: CounterStore) {
    this.valueStore = store('value');
  }

  increment() {
    this.valueStore.set(this.valueStore.state() + 1);
  }

  decrement() {
    this.valueStore.set(this.valueStore.state() - 1);
  }

  reset() {
    this.valueStore.set(0);
  }
}
