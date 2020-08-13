import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppStore } from 'ng-app-state';
import {
  DeepState,
  runDeep,
  subscribeDeep,
} from '../../../projects/ng-app-state/src/performance/deep-performance';

@Component({
  selector: 'app-deep-performance',
  templateUrl: './deep-performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeepPerformanceComponent {
  depth = 1000;
  iterations = 1000;

  constructor(private ngrxStore: Store<any>) {}

  run() {
    const store: any = new AppStore(
      this.ngrxStore,
      'testKey',
      new DeepState(this.depth),
    );
    const { subscription } = subscribeDeep(store);
    runDeep(store, this.iterations);
    subscription.unsubscribe();
    store.delete();
  }
}
