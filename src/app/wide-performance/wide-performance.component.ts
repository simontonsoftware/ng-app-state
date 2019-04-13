import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppStore } from "ng-app-state";
import {
  runWide,
  subscribeWide,
  WideState,
} from "../../../projects/ng-app-state/src/performance/wide-performance";

@Component({
  selector: "app-wide-performance",
  templateUrl: "./wide-performance.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidePerformanceComponent {
  width = 1000;
  iterations = 1000;

  constructor(private ngrxStore: Store<any>) {}

  run() {
    const store: any = new AppStore(
      this.ngrxStore,
      "testKey",
      new WideState(this.width),
    );
    const { subscription } = subscribeWide(store);
    runWide(store, this.iterations);
    subscription.unsubscribe();
    store.delete();
  }
}
