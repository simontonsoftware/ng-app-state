import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { times } from "micro-dash";
import { AppStore, StoreObject } from "ng-app-state";

const width = 1000;

class State {
  array = times(width, () => ({ counter: 0 }));
}

@Component({
  selector: "app-wide-performance",
  template: `
    <button (click)="run()">Wide Performance</button> {{ time }} ms,
    {{ fires }} fires
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidePerformanceComponent {
  time = 0;
  fires = 0;
  private store: StoreObject<State>;

  constructor(private ngrxStore: Store<any>) {
    this.store = new AppStore(ngrxStore, "testKey", new State());
    for (let i = width; --i >= 0; ) {
      this.store("array")(i)("counter").$.subscribe(() => ++this.fires);
    }
  }

  run() {
    const start = new Date().getTime();
    for (let i = width; --i >= 0; ) {
      this.store("array")(i)("counter").setUsing(increment);
    }
    const end = new Date().getTime();
    this.time = end - start;
  }
}

function increment(i: number) {
  return i + 1;
}
