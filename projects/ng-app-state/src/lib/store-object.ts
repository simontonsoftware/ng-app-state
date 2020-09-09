import { clone, every, forOwn, memoize, omit } from 'micro-dash';
import { Observable, Subscriber } from 'rxjs';
import { CallableObject } from 's-js-utils';

/** @hidden */
interface Client {
  runInBatch(func: () => void): void;
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
  private isActive: boolean;
  private lastKnownState?: T;
  private lastKnownStateChanged = false;
  private subscribers = new Set<Subscriber<T>>();
  private activeChildren: Record<string, Set<StoreObject<any>>> = {};
  private observable = new Observable<T>((subscriber) => {
    this.subscribers.add(subscriber);
    this.maybeActivate();
    subscriber.next(this.state());
    return () => {
      this.subscribers.delete(subscriber);
      this.maybeDeactivate();
    };
  });

  protected constructor(
    private client: Client,
    private parent: StoreObject<any> | undefined,
    private key: string | number,
    private _withCaching = false,
  ) {
    super(
      maybeMemoize(
        (childKey: keyof T) =>
          new StoreObject(
            client,
            this,
            childKey as string | number,
            _withCaching,
          ),
        _withCaching,
      ),
    );
    this.isActive = !parent;
  }

  /**
   * An `Observable` of the state of this store object.
   */
  get $(): Observable<T> {
    return this.observable;
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
  batch(func: () => void): void {
    this.client.runInBatch(func);
  }

  /**
   * Replace the state represented by this store object with the given value.
   */
  set(value: T): void {
    if (value === this.state()) {
      return;
    }

    if (this.parent) {
      const parentState = clone(this.parent.state());
      if (!parentState) {
        throw new Error('cannot modify when parent state is missing');
      }

      parentState[this.key] = value;
      this.parent.set(parentState);
    } else {
      this.updateState(value);
      this.maybeEmit();
    }
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
    if (this.parent) {
      this.parent.setUsing(omit, this.key);
    } else {
      this.set(undefined as any);
    }
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
    this.set(func(this.state(), ...args));
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
    const state = clone(this.state());
    func(state, ...args);
    this.set(state);
  }

  /**
   * Retrieve the current state represented by this store object.
   */
  state(): T {
    if (this.isActive) {
      return this.lastKnownState!;
    } else {
      return this.parent!.state()?.[this.key];
    }
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
    // throw new Error('caching is not available yet');
    return new StoreObject(this.client, this.parent, this.key, value);
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
    if (this.parent && other.parent) {
      return (
        this.key === other.key && this.parent?.refersToSameStateAs(other.parent)
      );
    } else {
      return this === other;
    }
  }

  protected maybeEmit(): void {
    if (!this.lastKnownStateChanged) {
      return;
    }

    this.lastKnownStateChanged = false;
    for (const subscriber of this.subscribers) {
      subscriber.next(this.lastKnownState);
    }
    forOwn(this.activeChildren, (children) => {
      for (const child of children) {
        child.maybeEmit();
      }
    });
  }

  private maybeActivate(): void {
    if (!this.parent || this.isActive) {
      return;
    }

    let set = this.parent.activeChildren[this.key];
    if (!set) {
      set = this.parent.activeChildren[this.key] = new Set<StoreObject<any>>();
    }
    set.add(this);
    this.isActive = true;
    this.parent.maybeActivate();
    this.lastKnownState = this.parent.state()?.[this.key];
  }

  private maybeDeactivate(): void {
    if (!this.parent || !this.isActive) {
      return;
    }

    const set = this.parent.activeChildren[this.key];
    set.delete(this);
    this.isActive = false;
    if (set.size === 0) {
      delete this.parent.activeChildren[this.key];
    }
  }

  private updateState(value: any): void {
    if (value === this.lastKnownState) {
      return;
    }

    this.lastKnownState = value;
    this.lastKnownStateChanged = true;
    forOwn(this.activeChildren, (children, key) => {
      for (const child of children) {
        child.updateState(value?.[key]);
      }
    });
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
