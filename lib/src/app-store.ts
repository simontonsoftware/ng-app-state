import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { StoreObject } from './store-object';

export class AppStore<T extends object> extends StoreObject<T> {
  private actionSubject = new Subject<Action>();

  /**
   * Emits the actions dispatched through this object.
   */
  public action$: Observable<Action> = this.actionSubject.asObservable();

  constructor(store: Store<any>, key: string, initialState: T) {
    super(store, [key], store);
    this.set(initialState);
  }

  /**
   * A convenience method to dispatch non-`ng-app-state` actions. This exists simply so you do not have to inject `Store` in case you are using something like `@ngrx/effects`.
   */
  public dispatch(action: Action) {
    this.store.dispatch(action);
    this.actionSubject.next(action);
  }
}
