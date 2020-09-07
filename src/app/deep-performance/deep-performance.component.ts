import { ChangeDetectionStrategy, Component } from '@angular/core';
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

  run(): void {
    const store: any = new AppStore(new DeepState(this.depth));
    const { subscription } = subscribeDeep(store);
    runDeep(store, this.iterations);
    subscription.unsubscribe();
    store.delete();
  }
}
