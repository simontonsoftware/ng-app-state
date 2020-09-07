import { bindKey, get } from 'micro-dash';
import { StoreObject } from './store-object';
import { TreeBasedObservableFactory } from './tree-based-observable/tree-based-observable-factory';

// TODO: rename `RootStore`?
export class AppStore<T extends object> extends StoreObject<T> {
  constructor(state: T) {
    const observableFactory = new TreeBasedObservableFactory<T>(state);
    let batchCount = 0;
    super(
      {
        getState: (path) => (path.length ? get(state, path) : state),
        getState$: bindKey(observableFactory, 'getState$'),
        setRootState: (value) => {
          state = value;
          observableFactory.setState(state, !batchCount);
        },
        runInBatch: (func: () => void) => {
          ++batchCount;
          try {
            func();
          } finally {
            if (--batchCount === 0) {
              observableFactory.setState(state, true);
            }
          }
        },
      },
      [],
      undefined,
    );
  }
}
