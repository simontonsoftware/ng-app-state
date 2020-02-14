import { Action, Store } from "@ngrx/store";
import { bindKey } from "micro-dash";
import { Observable, Subject } from "rxjs";
import { TreeBasedObservableFactory } from "./tree-based-observable/tree-based-observable-factory";
import { StoreObject } from "./store-object";

export class AppStore<T extends object> extends StoreObject<T> {
  /**
   * Emits the custom actions dispatched through this object (via `.dispatch()`).
   */
  action$: Observable<Action>;

  private store: Store<any>;
  private actionSubject: Subject<Action>;

  constructor(ngrxStore: Store<any>, key: string, initialState: T) {
    const observableFactory = TreeBasedObservableFactory.getFor(ngrxStore);
    super(
      {
        getState: bindKey(observableFactory, "getState"),
        getState$: bindKey(observableFactory, "getState$"),
        dispatch: bindKey(ngrxStore, "dispatch"),
      },
      [key],
    );

    this.store = ngrxStore;
    this.actionSubject = new Subject<Action>();
    this.action$ = this.actionSubject.asObservable();

    this.set(initialState);
  }

  /**
   * Dispatches a custom actions both on the global `@ngrx/store` (in case you are using something like `@ngrx/effects`), as well as emitted from `.action$`.
   */
  public dispatch(action: Action) {
    this.store.dispatch(action);
    this.actionSubject.next(action);
  }
}
