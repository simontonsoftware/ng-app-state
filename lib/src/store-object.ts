import { Action, Store } from '@ngrx/store';
import {
  Function1,
  Function2,
  Function3,
  Function4,
  isEqual,
  memoize,
  omit,
} from 'micro-dash';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operators/take';
import { BatchAction } from './actions/batch-action';
import { FunctionAction } from './actions/function-action';
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
    private _withCaching = false,
  ) {
    super(
      maybeMemoize(
        (prop: string) =>
          new StoreObject(store, [...path, prop], dispatcher, _withCaching),
        _withCaching,
      ),
    );
  }

  /**
   * An `Observable` of the state of this store object.
   */
  public get $(): Observable<T> {
    if (!this._$) {
      this._$ = (this.store.select as any)(...this.path);
    }
    return this._$;
  }

  /**
   * Allows batching multiple mutations on this store object so that observers only receive one event. E.g.:
   * ```ts
   * store.batch((batch) => {
   *   batch.assign({ key1: value1 });
   *   batch('key2').delete();
   *   batch('key3').set({ key4: value4 });
   * });
   * ```
   */
  public batch(func: (state: StoreObject<T>) => void) {
    const batch = new BatchAction();
    func(new StoreObject(this.store, this.path, batch));
    this.dispatcher.dispatch(batch);
  }

  /**
   * Returns a copy of this store object that will operate within the given batch. E.g.:
   * ```ts
   * const existingStoreObject: StoreObject<string>;
   * store.batch((batch) => {
   *   batch('key1').set('a new value');
   *   existingStoreObject.inBatch(batch).set('a second value');
   * });
   * ```
   */
  public inBatch(batch: StoreObject<any>) {
    return new StoreObject<T>(this.store, this.path, batch.dispatcher);
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
   * Removes the state represented by this store object from its parent. E.g. to remove the current user:
   * ```ts
   * store('currentUser').delete();
   * ```
   */
  public delete() {
    new StoreObject(
      this.store,
      this.path.slice(0, -1),
      this.dispatcher,
    ).setUsing(omit, this.path[this.path.length - 1]);
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
    func: Function4<T, A, B, C, T>,
    a: A,
    b: B,
    c: C,
  ): void;
  public setUsing(func: Function, ...args: any[]) {
    this.dispatcher.dispatch(new FunctionAction(this.path, false, func, args));
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
    func: Function4<T, A, B, C, void>,
    a: A,
    b: B,
    c: C,
  ): void;
  public mutateUsing(func: Function, ...args: any[]) {
    this.dispatcher.dispatch(new FunctionAction(this.path, true, func, args));
  }

  /**
   * Retrieve the current state represented by this store object.
   */
  public state() {
    let value: T;
    this.$.pipe(take(1)).subscribe((v) => {
      value = v;
    });
    return value!;
  }

  /**
   * Creates a new store object representing the same state as this one, but with caching turned on or off. When caching is on, selecting the same sub-store multiple times will return the same object. This allows you to safely use expressions like this in an Angular template:
   *
   * ```html
   * <child-component [childStore]="myStore('subKey')"></child-component>
   * ```
   *
   * Without caching `myStore('subKey')` would evaluate to a new object every time change detection runs.
   *
   * Caching propogates to descendant stores, so e.g. `myStore('subKey')('deepKey')` always return the same object, which will itself have caching turned on.
   *
   * This method does not modify the current store object; it returns a new one with the given setting.
   */
  public withCaching(value = true): StoreObject<T> {
    return new StoreObject(this.store, this.path, this.dispatcher, value);
  }

  /**
   * @return whether or not caching is turned on for this store object. See `.withCaching()` for details.
   */
  public caches() {
    return this._withCaching;
  }

  /**
   * @returns whether the given `StoreObject` operates on the same slice of the store as this object.
   */
  public refersToSameStateAs(other: StoreObject<T>) {
    return isEqual(this.path, other.path);
  }
}

function maybeMemoize(fn: Function, withCaching: boolean) {
  if (withCaching) {
    return memoize(fn);
  } else {
    return fn;
  }
}
