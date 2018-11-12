import { Action } from "@ngrx/store";
import { every, isEqual, last, memoize, omit } from "micro-dash";
import { Observable } from "rxjs";
import { CallableObject } from "s-js-utils";
import { BatchAction } from "./actions/batch-action";
import { FunctionAction } from "./actions/function-action";
import { TreeBasedObservableFactory } from "./tree-based-observable-factory";

export interface StoreObject<T> {
  // tslint:disable:callable-types
  /**
   * Select a slice of the store to operate on. For example `store('currentUser')` will return a new `StoreObject` that represents the `currentUser` property.
   */
  <K extends keyof T, V extends T[K]>(attr: K): StoreObject<V>;
}

export class StoreObject<T> extends CallableObject {
  private _$?: Observable<T>;

  protected constructor(
    private observableFactory: TreeBasedObservableFactory,
    private path: string[],
    private dispatcher: { dispatch(action?: Action): void },
    private _withCaching = false,
  ) {
    super(
      maybeMemoize(
        (prop: keyof T) =>
          new StoreObject(
            observableFactory,
            [...path, prop.toString()],
            dispatcher,
            _withCaching,
          ),
        _withCaching,
      ),
    );
  }

  /**
   * An `Observable` of the state of this store object.
   */
  public get $(): Observable<T> {
    if (!this._$) {
      this._$ = this.observableFactory.get<T>(this.path);
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
    func(new StoreObject(this.observableFactory, this.path, batch));
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
    return new StoreObject<T>(
      this.observableFactory,
      this.path,
      batch.dispatcher,
    );
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
    this.setUsing((state: any) => {
      if (every(value, (innerValue, key) => state[key] === innerValue)) {
        return state;
      } else {
        return { ...state, ...(value as any) };
      }
    });
  }

  /**
   * Removes the state represented by this store object from its parent. E.g. to remove the current user:
   * ```ts
   * store('currentUser').delete();
   * ```
   */
  public delete() {
    new StoreObject<Partial<{ [key: string]: T }>>(
      this.observableFactory,
      this.path.slice(0, -1),
      this.dispatcher,
    ).setUsing(omit, last(this.path));
  }

  /**
   * Runs `func` on the state and replaces it with the return value. The first argument to `func` will be the state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate the state.
   */
  public setUsing<A extends any[]>(
    func: (state: T, ...args: A) => T,
    ...args: A
  ) {
    this.dispatcher.dispatch(new FunctionAction(this.path, false, func, args));
  }

  /**
   * Runs `func` on a shallow clone of the state, replacing the state with the clone. The first argument to `func` will be the cloned state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate nested objects within the state.
   */
  public mutateUsing<A extends any[]>(
    func: (state: T, ...args: A) => void,
    ...args: A
  ) {
    this.dispatcher.dispatch(new FunctionAction(this.path, true, func, args));
  }

  /**
   * Retrieve the current state represented by this store object.
   */
  public state(): T {
    return this.observableFactory.getState(this.path);
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
    return new StoreObject(
      this.observableFactory,
      this.path,
      this.dispatcher,
      value,
    );
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
