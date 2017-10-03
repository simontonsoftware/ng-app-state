import { Action, Store } from '@ngrx/store';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { AssignAction } from './actions/assign-action';
import { BatchAction } from './actions/batch-action';
import { DeleteAction } from './actions/delete-action';
import { MergeAction } from './actions/merge-action';
import { SetAction } from './actions/set-action';
import { Dispatcher } from './dispatcher';
import { ExtensibleFunction } from './utils/extensible-function';

export interface StoreObject<T> {
  /**
   * Select a slice of the store to operate on. For example `store('currentUser')` will return a new `StoreObject` that represents the `currentUser` property.
   */
    <K extends keyof T>(attr: K): StoreObject<T[K]>;
}

export class StoreObject<T> extends ExtensibleFunction {
  private _$: Observable<T>;

  protected constructor(
    private store: Store<T>,
    private path: string[],
    private dispatcher: Dispatcher,
  ) {
    super(
      (prop: string) => new StoreObject(store, [...path, prop], dispatcher),
    );
  }

  /**
   * An `Observable` of the state of this store object.
   */
  public get $(): Observable<T> {
    if (!this._$) {
      if (this.path.length) {
        this._$ = (this.store.select as any)(...this.path);
      } else {
        this._$ = this.store;
      }
    }
    return this._$;
  }

  /**
   * Allows batching multiple mutations on this store object so that observers only receive one event. E.g.:
   * ```ts
   * store.batch((batch) => {
   *   batch.assign({ key1: value1 });
   *   batch('key2').delete();
   *   batch('key3').merge({ key4: value4 });
   * });
   * ```
   */
  public batch(func: (state: StoreObject<T>) => void) {
    const batch = new BatchAction(this.dispatcher);
    func(new StoreObject(this.store, this.path, batch));
    batch.dispatch();
  }

  /**
   * Replace the state represented by this store object with the given value.
   */
  public set(value: T) {
    new SetAction(this.dispatcher, this.path, value).dispatch();
  }

  /**
   * Assigns the given values to state of this store object. The resulting state will be like `Object.assign(store.state(), value)`.
   */
  public assign(value: Partial<T>) {
    new AssignAction(this.dispatcher, this.path, value).dispatch();
  }

  /**
   * Does a deep merge of the gives value into the current state. The result will be like a [lodash merge](https://lodash.com/docs/4.17.4#merge).
   */
  public merge(value: Partial<T>) {
    new MergeAction(this.dispatcher, this.path, value).dispatch();
  }

  /**
   * Removes the state represented by this store object from its parent. E.g. to remove the current user:
   * ```ts
   * store('currentUser').delete();
   * ```
   */
  public delete() {
    new DeleteAction(this.dispatcher, this.path).dispatch();
  }

  /**
   * Retrieve the current state represented by this store object.
   */
  public state() {
    let value: T;
    this.$.take(1).subscribe((v) => value = v);
    return value!;
  }

  /**
   * A convenience method to dispatch non-`ng-app-state` actions. This exists simply so you do not have to inject `Store` in case you are using something like `@ngrx/effects`.
   */
  public dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
