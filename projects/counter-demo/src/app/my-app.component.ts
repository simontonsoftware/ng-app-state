import { Component } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { Observable } from "rxjs";
import { INCREMENT, DECREMENT, RESET } from "./counter";

interface AppState {
  count: number;
}

@Component({
  selector: "my-app",
  template: `
    <button (click)="increment()">Increment</button>
    <div>Current Count: {{ count$ | async }}</div>
    <button (click)="decrement()">Decrement</button>

    <button (click)="reset()">Reset Counter</button>
  `,
})
export class MyAppComponent {
  count$: Observable<number>;

  constructor(private store: Store<AppState>) {
    this.count$ = store.pipe(select("count"));
  }

  increment() {
    this.store.dispatch({ type: INCREMENT });
  }

  decrement() {
    this.store.dispatch({ type: DECREMENT });
  }

  reset() {
    this.store.dispatch({ type: RESET });
  }
}
