import { Store } from '@ngrx/store';
import { StoreObject } from './store-object';

export class AppStore<T extends object> extends StoreObject<T> {
  constructor(store: Store<any>, key: string, initialState: T) {
    super(store, [key], store);
    this.set(initialState);
  }
}
