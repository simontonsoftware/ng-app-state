import { bindKey, get } from 'micro-dash';
import { BehaviorSubject } from 'rxjs';
import { StoreObject } from './store-object';
import { TreeBasedObservableFactory } from './tree-based-observable/tree-based-observable-factory';

// TODO: rename `RootStore`?
export class AppStore<T extends object> extends StoreObject<T> {
  constructor(state: T) {
    const state$ = new BehaviorSubject(state);
    const observableFactory = TreeBasedObservableFactory.getFor(state$);
    let batchCount = 0;
    super(
      {
        getState: (path) => (path.length ? get(state, path) : state),
        getState$: bindKey(observableFactory, 'getState$'),
        setRootState: (value) => {
          state = value;
          if (!batchCount) {
            state$.next(state);
          }
        },
        runInBatch: (func: () => void) => {
          ++batchCount;
          try {
            func();
          } finally {
            if (--batchCount === 0) {
              state$.next(state);
            }
          }
        },
      },
      [],
      undefined,
    );
  }
}
