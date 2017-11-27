import { Action, Store } from '@ngrx/store';
import { Function1, Function2, Function3, Function4, omit } from 'micro-dash';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operators/take';
import { BatchAction } from './actions/batch-action';
import { MergeAction } from './actions/merge-action';
import { MutateUsingAction } from './actions/mutate-using-action';
import { SetUsingAction } from './actions/set-using-action';
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
    if (!this._$) { this._$ = (this.store.select as any)(...this.path); }
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
    this.setUsing(() => value);
  }

  /**
   * Assigns the given values to state of this store object. The resulting state will be like `Object.assign(store.state(), value)`.
   */
  public assign(value: Partial<T>) {
    this.mutateUsing(Object.assign, value);
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
    new StoreObject(this.store, this.path.slice(0, -1), this.dispatcher)
      .setUsing(omit, this.path[this.path.length - 1]);
  }

  /**
   * Runs `func` on the state and replaces it with the return value. The first argument to `func` will be the state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate the state.
   */
  public setUsing(func: Function1<T, T>): void;
  public setUsing<A>(func: Function2<T, A, T>, a: A): void;
  public setUsing<A, B>(func: Function3<T, A, B, T>, a: A, b: B): void;
  public setUsing<A, B, C>(
    func: Function4<T, A, B, C, T>, a: A, b: B, c: C,
  ): void;
  public setUsing(func: Function, ...args: any[]) {
    this.dispatcher.dispatch(new SetUsingAction(this.path, func, args));
  }

  /**
   * Runs `func` on a shallow clone of the state, replacing the state with the clone. The first argument to `func` will be the cloned state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate nested objects within the state.
   */
  public mutateUsing(func: Function1<T, void>): void;
  public mutateUsing<A>(func: Function2<T, A, void>, a: A): void;
  public mutateUsing<A, B>(func: Function3<T, A, B, void>, a: A, b: B): void;
  public mutateUsing<A, B, C>(
    func: Function4<T, A, B, C, void>, a: A, b: B, c: C,
  ): void;
  public mutateUsing(func: Function, ...args: any[]) {
    this.dispatcher.dispatch(new MutateUsingAction(this.path, func, args));
  }

  /**
   * Retrieve the current state represented by this store object.
   */
  public state() {
    let value: T;
    this.$.pipe(take(1)).subscribe((v) => { value = v; });
    return value!;
  }

  /**
   * A convenience method to dispatch non-`ng-app-state` actions. This exists simply so you do not have to inject `Store` in case you are using something like `@ngrx/effects`.
   */
  public dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
