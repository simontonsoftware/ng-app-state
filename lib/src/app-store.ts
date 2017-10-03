import { Store } from '@ngrx/store';
import { AppStateAction } from './app-state-action';
import { StoreObject } from './store-object';

export class AppStore<T extends object> extends StoreObject<T> {
  constructor(store: Store<any>, key: string, initialState: T) {
    super(store.select(key), key, [], store);
    store.addReducer(key, (state = initialState, action) => {
      if (
        action instanceof AppStateAction
        && action.rootKey === this.rootKey
      ) {
        return action.execute(state);
      } else {
        return state;
      }
    });
  }
}
