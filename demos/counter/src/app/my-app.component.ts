import { Component } from '@angular/core';
import { StoreObject } from 'ng-app-state';
import { CounterStore } from './counter-store';

@Component({
  selector: 'my-app',
  template: `
    <button (click)="increment()">Increment</button>
    <div>Current Count: {{ counterStore.$ | async }}</div>
    <button (click)="decrement()">Decrement</button>

    <button (click)="reset()">Reset Counter</button>
  `,
})
export class MyAppComponent {
  counterStore: StoreObject<number>;

  constructor(store: CounterStore) {
    this.counterStore = store('counter');
  }

  increment() {
    this.counterStore.set(this.counterStore.state() + 1);
  }

  decrement() {
    this.counterStore.set(this.counterStore.state() - 1);
  }

  reset() {
    this.counterStore.set(0);
  }
}
