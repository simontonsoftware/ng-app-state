import { Action, Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import { TreeBasedObservableFactory } from "./tree-based-observable/tree-based-observable-factory";
import { StoreObject } from "./store-object";

export class AppStore<T extends object> extends StoreObject<T> {
  /**
   * Emits the actions dispatched through this object.
   */
  action$: Observable<Action>;

  private store: Store<any>;
  private actionSubject: Subject<Action>;

  constructor(store: Store<any>, key: string, initialState: T) {
    const observableFactory = new TreeBasedObservableFactory(store);
    super(observableFactory, [key], store, observableFactory);

    this.store = store;
    this.actionSubject = new Subject<Action>();
    this.action$ = this.actionSubject.asObservable();

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
