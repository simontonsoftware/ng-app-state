import {Store} from '@ngrx/store';
import {AppStateAction} from './app-state-action';
import {StateObject} from './state-object';

export class AppStore<T extends object> extends StateObject<T> {
  constructor(store: Store<any>, key: string, initialState: T) {
    super(store.select(key), [], store);
    store.addReducer(key, (state = initialState, action) => {
      if (action instanceof AppStateAction) {
        return action.execute(state);
      } else {
        return state;
      }
    });
  }
}
