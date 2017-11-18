import { Action, Store } from '@ngrx/store';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { AssignAction } from './actions/assign-action';
import { BatchAction } from './actions/batch-action';
import { DeleteAction } from './actions/delete-action';
import { MergeAction } from './actions/merge-action';
import { SetAction } from './actions/set-action';
import { ExtensibleFunction } from './utils/extensible-function';

export interface StoreObject<T> {
  /**
   * Select a slice of the store to operate on. For example `store('currentUser')` will return a new `StoreObject` that represents the `currentUser` property.
   */
  <K extends keyof T, V extends T[K]>(attr: K): StoreObject<V>;
}

export class StoreObject<T> extends ExtensibleFunction {
  private _$: Observable<T>;

  protected constructor(
    protected store: Store<any>,
    private path: string[],
    private dispatcher: { dispatch(action?: Action): void },
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
    const batch = new BatchAction();
    func(new StoreObject(this.store, this.path, batch));
    this.dispatcher.dispatch(batch);
  }

  /**
   * Replace the state represented by this store object with the given value.
   */
  public set(value: T) {
    this.dispatcher.dispatch(new SetAction(this.path, value));
  }

  /**
   * Assigns the given values to state of this store object. The resulting state will be like `Object.assign(store.state(), value)`.
   */
  public assign(value: Partial<T>) {
    this.dispatcher.dispatch(new AssignAction(this.path, value));
  }

  /**
   * Does a deep merge of the gives value into the current state. The result will be like a [lodash merge](https://lodash.com/docs/4.17.4#merge).
   */
  public merge(value: Partial<T>) {
    this.dispatcher.dispatch(new MergeAction(this.path, value));
  }

  /**
   * Removes the state represented by this store object from its parent. E.g. to remove the current user:
   * ```ts
   * store('currentUser').delete();
   * ```
   */
  public delete() {
    this.dispatcher.dispatch(new DeleteAction(this.path));
  }

  /**
   * Retrieve the current state represented by this store object.
   */
  public state() {
    let value: T;
    this.$.take(1).subscribe((v) => { value = v; });
    return value!;
  }

  /**
   * A convenience method to dispatch non-`ng-app-state` actions. This exists simply so you do not have to inject `Store` in case you are using something like `@ngrx/effects`.
   */
  public dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
