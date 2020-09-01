import { bindKey } from 'micro-dash';
import { BehaviorSubject } from 'rxjs';
import { StoreObject } from './store-object';
import { TreeBasedObservableFactory } from './tree-based-observable/tree-based-observable-factory';

// TODO: rename `RootStore`?
export class AppStore<T extends object> extends StoreObject<T> {
  // private batchCount: number;

  constructor(state: T) {
    const state$ = new BehaviorSubject(state);
    const observableFactory = TreeBasedObservableFactory.getFor(state$);
    super(
      {
        getState: bindKey(observableFactory, 'getState'),
        getState$: bindKey(observableFactory, 'getState$'),
        setRootState: (value) => {
          state$.next(value);
        },
      },
      [],
      undefined,
    );
    // this.batchCount = 0;
  }
}
