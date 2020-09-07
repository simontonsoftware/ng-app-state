import { StoreObject } from './store-object';

// TODO: rename `RootStore`?
export class AppStore<T extends object> extends StoreObject<T> {
  private batchCount = 0;

  constructor(state: T) {
    super(
      {
        runInBatch: (func: () => void) => {
          ++this.batchCount;
          try {
            func();
          } finally {
            if (--this.batchCount === 0) {
              this.maybeEmit();
            }
          }
        },
      },
      [],
      undefined,
    );
    this.set(state);
  }

  protected maybeEmit(): void {
    if (this.batchCount === 0) {
      super.maybeEmit();
    }
  }
}
