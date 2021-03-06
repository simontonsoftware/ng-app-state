import { Action } from '@ngrx/store';
import { bindKey, every, isEqual, last, memoize, omit } from 'micro-dash';
import { Observable } from 'rxjs';
import { CallableObject } from 's-js-utils';
import { BatchAction } from './actions/batch-action';
import { buildName, FunctionAction } from './actions/function-action';

/** @hidden */
interface Client {
  getState(path: string[]): any;
  getState$(path: string[]): Observable<any>;
  dispatch(action?: Action): void;
}

/** @hidden */
type GetSlice<T> = <K extends keyof T>(attr: K) => StoreObject<T[K]>;

export interface StoreObject<T> extends GetSlice<T> {
  // tslint:disable:callable-types
  /**
   * Select a slice of the store to operate on. For example `store('currentUser')` will return a new `StoreObject` that represents the `currentUser` property.
   */
  <K extends keyof T, V extends T[K]>(attr: K): StoreObject<V>;
}

export class StoreObject<T> extends CallableObject<GetSlice<T>> {
  private _$?: Observable<T>;

  protected constructor(
    private client: Client,
    private path: string[],
    private _withCaching = false,
  ) {
    super(
      maybeMemoize(
        (prop: keyof T) =>
          new StoreObject(client, path.concat(prop.toString()), _withCaching),
        _withCaching,
      ),
    );
  }

  /**
   * An `Observable` of the state of this store object.
   */
  get $(): Observable<T> {
    if (!this._$) {
      this._$ = this.client.getState$(this.path);
    }
    return this._$;
  }

  /**
   * Allows batching multiple mutations on this store object so that observers only receive one event. The batch maintains its own fork of the full global state until it completes, then commits it to the store. Calls to `.state()` on the batch will fetch from the forked state.
   *
   * ```ts
   * store.batch((batch) => {
   *   batch.assign({ key1: value1 });
   *   batch('key2').delete();
   *   batch('key3').set({ key4: value4 });
   *
   *   batch('key1').state(); // returns `value1`
   *   store('key1').state(); // don't do this. may not return `value1`
   * });
   * ```
   */
  batch(func: (state: StoreObject<T>) => void): void {
    const batch = new BatchAction(this.client.getState([]));
    func(
      new StoreObject(
        {
          getState: bindKey(batch, 'getState'),
          getState$: this.client.getState$,
          dispatch: bindKey(batch, 'dispatch'),
        },
        this.path,
      ),
    );
    this.client.dispatch(batch);
  }

  /**
   * Returns a copy of this store object that will operate within the given batch.
   *
   * ```ts
   * const existingStoreObject: StoreObject<string>;
   * store.batch((batch) => {
   *   batch('key1').set('a new value');
   *   existingStoreObject.inBatch(batch).set('a second value');
   * });
   * ```
   */
  inBatch(batch: StoreObject<any>): StoreObject<T> {
    return new StoreObject<T>(batch.client, this.path);
  }

  /**
   * Replace the state represented by this store object with the given value.
   */
  set(value: T): void {
    this.setUsing(() => value);
  }

  /**
   * Assigns the given values to state of this store object. The resulting state will be like `Object.assign(store.state(), value)`.
   */
  assign(value: Partial<T>): void {
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
   *
   * ```ts
   * store('currentUser').delete();
   * ```
   */
  delete(): void {
    const key = last(this.path);
    this.client.dispatch(
      new FunctionAction('delete:' + key, this.path.slice(0, -1), false, omit, [
        key,
      ]),
    );
  }

  /**
   * Runs `func` on the state and replaces it with the return value. The first argument to `func` will be the state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate the state.
   */
  setUsing<A extends any[]>(
    func: (state: T, ...args: A) => T,
    ...args: A
  ): void {
    this.client.dispatch(
      new FunctionAction(buildName('set', func), this.path, false, func, args),
    );
  }

  /**
   * Runs `func` on a shallow clone of the state, replacing the state with the clone. The first argument to `func` will be the cloned state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate nested objects within the state.
   */
  mutateUsing<A extends any[]>(
    func: (state: T, ...args: A) => void,
    ...args: A
  ): void {
    this.client.dispatch(
      new FunctionAction(
        buildName('mutate', func),
        this.path,
        true,
        func,
        args,
      ),
    );
  }

  /**
   * Retrieve the current state represented by this store object.
   */
  state(): T {
    return this.client.getState(this.path);
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
  withCaching(value = true): StoreObject<T> {
    return new StoreObject(this.client, this.path, value);
  }

  /**
   * @return whether or not caching is turned on for this store object. See `.withCaching()` for details.
   */
  caches(): boolean {
    return this._withCaching;
  }

  /**
   * @returns whether the given `StoreObject` operates on the same slice of the store as this object.
   */
  refersToSameStateAs(other: StoreObject<T>): boolean {
    return isEqual(this.path, other.path);
  }
}

/** @hidden */
// tslint:disable-next-line:ban-types
function maybeMemoize<F extends Function>(fn: F, withCaching: boolean): F {
  if (withCaching) {
    return memoize(fn);
  } else {
    return fn;
  }
}
