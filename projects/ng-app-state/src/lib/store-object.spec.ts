import { TestBed } from "@angular/core/testing";
import { Action, Store, StoreModule } from "@ngrx/store";
import { cloneDeep, identity, pick } from "micro-dash";
import { skip, take } from "rxjs/operators";
import { expectSingleCallAndReset } from "s-ng-dev-utils";
import { AppStore } from "./app-store";
import { ngAppStateReducer } from "./ng-app-state-reducer";
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;

class InnerState {
  left?: InnerState;
  right?: InnerState;

  constructor(public state = 0) {}
}

class State {
  counter = 0;
  nested = new InnerState();
  optional?: InnerState;
  array?: number[];
}

describe("StoreObject", () => {
  let backingStore: Store<any>;
  let store: AppStore<State>;
  let logError: Spy;

  beforeEach(() => {
    logError = spyOn(console, "error");
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] })],
    });
    backingStore = TestBed.get(Store);
    store = new AppStore(backingStore, "testKey", new State());
  });

  describe("()", () => {
    it("prints a useful error when used to modify missing state", () => {
      store<"optional", InnerState>("optional")("state").set(2);
      expect(logError).toHaveBeenCalledWith(
        "testKey.optional is null or undefined (during [set] testKey.optional.state)",
      );
    });

    it("prints a useful error even when the root key is missing", () => {
      store.delete();
      store<"optional", InnerState>("optional")("state").set(2);
      expect(logError).toHaveBeenCalledWith(
        "testKey is null or undefined (during [set] testKey.optional.state)",
      );
    });
  });

  describe(".$", () => {
    it("fires immediately, and with every change", () => {
      const rootNext = jasmine.createSpy();
      const counterNext = jasmine.createSpy();
      const nestedNext = jasmine.createSpy();
      store.$.subscribe(rootNext);
      store("counter").$.subscribe(counterNext);
      store("nested").$.subscribe(nestedNext);
      expect(rootNext).toHaveBeenCalledTimes(1);
      expect(counterNext).toHaveBeenCalledTimes(1);
      expect(nestedNext).toHaveBeenCalledTimes(1);

      store("counter").set(5);
      expect(rootNext).toHaveBeenCalledTimes(2);
      expect(counterNext).toHaveBeenCalledTimes(2);

      store("nested")("state").set(15);
      expect(rootNext).toHaveBeenCalledTimes(3);
      expect(nestedNext).toHaveBeenCalledTimes(2);
    });

    it("gives the new value", () => {
      let lastValue: InnerState;
      store("nested").$.subscribe((value) => {
        lastValue = value;
      });
      expect(lastValue!).toBe(store.state().nested);
      expect(lastValue!).toEqual(new InnerState());

      const newValue = new InnerState(4);
      store("nested").set(newValue);
      expect(lastValue!).toBe(newValue);
      expect(lastValue!).toEqual(new InnerState(4));
    });

    it("gives undefined when a parent object is deleted", () => {
      const next = jasmine.createSpy();

      store<"optional", InnerState>("optional")("state").$.subscribe(next);
      expectSingleCallAndReset(next, undefined);

      store("optional").set(new InnerState(17));
      expectSingleCallAndReset(next, 17);

      store("optional").delete();
      expectSingleCallAndReset(next, undefined);
    });

    it("does not fire when parent objects change", () => {
      const counterNext = jasmine.createSpy();
      const optionalNext = jasmine.createSpy();
      store("counter").$.subscribe(counterNext);
      store<"optional", InnerState>("optional")("state").$.subscribe(
        optionalNext,
      );
      expect(counterNext).toHaveBeenCalledTimes(1);
      expect(optionalNext).toHaveBeenCalledTimes(1);

      store.delete();
      expect(counterNext).toHaveBeenCalledTimes(2);
      expect(optionalNext).toHaveBeenCalledTimes(1);

      store.set(new State());
      expect(counterNext).toHaveBeenCalledTimes(3);
      expect(optionalNext).toHaveBeenCalledTimes(1);

      store.set(new State());
      expect(counterNext).toHaveBeenCalledTimes(3);
      expect(optionalNext).toHaveBeenCalledTimes(1);

      store("optional").set(new InnerState());
      expect(counterNext).toHaveBeenCalledTimes(3);
      expect(optionalNext).toHaveBeenCalledTimes(2);
    });

    // This is important for use in angular templates, so each change detection cycle it gets the same object, so OnPush can work
    it("returns the same observable on successive calls", () => {
      const observable = store.$;
      expect(store.$).toBe(observable);

      store("counter").set(2);
      expect(store.$).toBe(observable);
    });

    // https://github.com/simontonsoftware/ng-app-state/issues/13
    it("does not emit stale values in the middle of propogating a change (production bug)", () => {
      let log: Spy | undefined;
      store.$.subscribe(() => {
        store("optional").$.subscribe(log);
      });
      store("optional").$.subscribe();

      log = jasmine.createSpy();
      const value = new InnerState();
      store("optional").set(value);

      expectSingleCallAndReset(log, value);
    });
  });

  describe(".batch()", () => {
    it("causes a single update after multiple actions", () => {
      const next = jasmine.createSpy();

      store.$.subscribe(next);
      expect(next).toHaveBeenCalledTimes(1);

      store.batch((batch) => {
        batch("counter").set(3);
        batch("nested")("state").set(6);
        expect(next).toHaveBeenCalledTimes(1);
      });

      expect(next).toHaveBeenCalledTimes(2);
      expect(store.state()).toEqual({ counter: 3, nested: { state: 6 } });
    });

    it("works when nested", () => {
      store.batch((batch1) => {
        batch1("counter").set(1);
        batch1.batch((batch2) => {
          expect(batch2.state().counter).toBe(1);
          batch2("counter").set(2);
          expect(batch2.state().counter).toBe(2);
        });
        expect(batch1.state().counter).toBe(2);
      });
      expect(store.state().counter).toBe(2);
    });
  });

  describe(".inBatch()", () => {
    it("causes mutations to run within the given batch", () => {
      const next = jasmine.createSpy();

      store.$.subscribe(next);
      expect(next).toHaveBeenCalledTimes(1);

      const counterStore = store("counter");
      const nestedStore = store("nested");
      store.batch((batch) => {
        counterStore.inBatch(batch).set(3);
        nestedStore
          .inBatch(batch)("state")
          .set(6);
        expect(next).toHaveBeenCalledTimes(1);
      });

      expect(next).toHaveBeenCalledTimes(2);
      expect(store.state()).toEqual({ counter: 3, nested: { state: 6 } });
    });
  });

  describe(".set()", () => {
    it("stores the exact object given", () => {
      const before = store.state().nested;
      const set = new InnerState();
      store("nested").set(set);
      const after = store.state().nested;

      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual(new InnerState());
    });

    it("works with undefined", () => {
      store("optional").set(new InnerState());
      expect(store.state().optional).not.toBeUndefined();
      store("optional").set(undefined);
      expect(store.state().optional).toBeUndefined();
    });

    it("works on the root object", () => {
      const before = store.state();
      const set = {
        counter: 2,
        nested: new InnerState(),
      };
      store.set(set);
      const after = store.state();

      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual({
        counter: 2,
        nested: new InnerState(),
      });
    });

    it("does nothing when setting to the same value", () => {
      const startingState = store.state();
      const stateClone = cloneDeep(startingState);
      store.$.pipe(skip(1)).subscribe(() => {
        fail("should not have fired");
      });

      store.set(startingState);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store("counter").set(startingState.counter);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store("nested").set(startingState.nested);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);
    });
  });

  describe(".assign()", () => {
    it("assigns the exact objects given", () => {
      const before = store.state().nested;
      const left = new InnerState();
      const right = new InnerState();
      store("nested").assign({ left, right });
      const after = store.state().nested;

      expect(before).not.toBe(after);
      expect(before.left).toBeUndefined();
      expect(before.right).toBeUndefined();
      expect(after.left).toBe(left);
      expect(after.right).toBe(right);
    });

    it("does nothing when setting to the same value", () => {
      const startingState = store.state();
      const stateClone = cloneDeep(startingState);
      store.$.pipe(skip(1)).subscribe(() => {
        fail("should not have fired");
      });

      store.assign(pick(startingState, "counter", "nested"));
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store.assign({});
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store("nested").assign(startingState.nested);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);
    });
  });

  describe(".delete()", () => {
    it("removes sub-trees from the store", () => {
      store("optional").set(new InnerState());
      store<"optional", InnerState>("optional")("left").set(new InnerState());
      expect(store.state().optional!.left).toEqual(new InnerState());

      store<"optional", InnerState>("optional")("left").delete();
      expect(store.state().optional).not.toBe(undefined);
      expect(store.state().optional!.left).toBe(undefined);

      store("optional").delete();
      expect(getGlobalState().testKey).not.toBe(undefined);
      expect(store.state().optional).toBe(undefined);

      store.delete();
      expect(getGlobalState().testKey).toBe(undefined);
    });

    it("has a type name that is nice for logging", () => {
      let lastAction: Action;
      backingStore.addReducer("testKey", (state: any, action) => {
        lastAction = action;
        return state;
      });

      store("nested").delete();

      expect(lastAction!.type).toBe("[delete:nested] testKey");
    });
  });

  describe(".setUsing()", () => {
    it("set the state to the exact object returned", () => {
      const object = new InnerState();
      store("optional").setUsing(() => object);
      expect(store.state().optional).toBe(object);
    });

    it("uses the passed-in arguments", () => {
      store("nested").setUsing(() => new InnerState(1));
      expect(store.state().nested.state).toBe(1);

      store("nested").setUsing(
        (_state, left, right) => {
          const newState = new InnerState(2);
          newState.left = left;
          newState.right = right;
          return newState;
        },
        new InnerState(3),
        new InnerState(4),
      );
      expect(store.state().nested.state).toBe(2);
      expect(store.state().nested.left!.state).toBe(3);
      expect(store.state().nested.right!.state).toBe(4);
    });

    it("is OK having `undefined` returned", () => {
      store("optional").set(new InnerState());

      expect(store.state().optional).not.toBe(undefined);
      store("optional").setUsing(() => undefined);
      expect(store.state().optional).toBe(undefined);
    });

    it("is OK having the same object returned", () => {
      const origState = store.state();
      store.setUsing(identity);
      expect(store.state()).toBe(origState);
    });

    it("prints a message and is not called when the state is missing", () => {
      const op = createSpy();
      store<"optional", InnerState>("optional")("left").setUsing(op);
      expect(op).not.toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(
        "testKey.optional is null or undefined (during [set] testKey.optional.left)",
      );
    });

    it("uses the name of the passed-in function in the action", () => {
      function myCustomFunction(state: State) {
        return state;
      }

      let lastEmitted: Action;
      backingStore.addReducer("testKey", (state = {}, action) => {
        lastEmitted = action;
        return state;
      });

      store.setUsing(myCustomFunction);
      expect(lastEmitted!.type).toEqual("[set:myCustomFunction] testKey");
    });

    it("does nothing when setting to the same value", () => {
      const startingState = store.state();
      const stateClone = cloneDeep(startingState);
      store.$.pipe(skip(1)).subscribe(() => {
        fail("should not have fired");
      });

      store.setUsing(identity);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store("counter").setUsing(identity);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store("nested").setUsing(identity);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);
    });
  });

  describe(".mutateUsing()", () => {
    it("uses the passed-in arguments", () => {
      store("array").set([]);

      store("array").mutateUsing((array) => {
        array!.push(1);
      });
      expect(store.state().array).toEqual([1]);

      store("array").mutateUsing(
        (array, a, b) => {
          array!.push(a, b);
        },
        2,
        3,
      );
      expect(store.state().array).toEqual([1, 2, 3]);
    });

    it("works when the state is undefined", () => {
      store("optional").mutateUsing((value) => {
        expect(value).toBe(undefined);
      });
    });

    it("prints a message and is not called when the state is missing", () => {
      const op = createSpy();
      store<"optional", InnerState>("optional")("left").mutateUsing(op);
      expect(op).not.toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(
        "testKey.optional is null or undefined (during [mutate] testKey.optional.left)",
      );
    });

    it("uses the name of the passed-in function in the action", () => {
      function myCustomFunction() {}

      let lastEmitted: Action;
      backingStore.addReducer("testKey", (state = {}, action) => {
        lastEmitted = action;
        return state;
      });

      store.mutateUsing(myCustomFunction);
      expect(lastEmitted!.type).toEqual("[mutate:myCustomFunction] testKey");
    });
  });

  describe(".state()", () => {
    it("works when there are no subscribers", () => {
      expect(store.state().nested.state).toBe(0);
      expect(store("nested").state().state).toBe(0);
      expect(store("nested")("state").state()).toBe(0);

      store("nested")("state").set(1);
      expect(store.state().nested.state).toBe(1);
      expect(store("nested").state().state).toBe(1);
      expect(store("nested")("state").state()).toBe(1);
    });

    it("gets the in-progress value of a batch", () => {
      store.batch(() => {
        store("counter").set(1);
        expect(store.state().counter).toBe(1);

        store("counter").set(2);
        expect(store.state().counter).toBe(2);
      });
    });

    it("gets the new subvalue even it has a later subscriber (production bug)", () => {
      let expectedValue: InnerState | undefined;
      store.$.subscribe(() => {
        expect(store("optional").state()).toBe(expectedValue);
      });
      store("optional").$.subscribe();

      expectedValue = new InnerState();
      store("optional").set(expectedValue);
    });
  });

  describe(".withCaching()", () => {
    it("caches descendant stores", () => {
      expect(store("counter")).not.toBe(store("counter"));
      expect(store("nested")("left")).not.toBe(store("nested")("left"));

      const cachingStore = store.withCaching();
      expect(cachingStore("counter")).toBe(cachingStore("counter"));
      expect(cachingStore("nested")("left")).toBe(
        cachingStore("nested")("left"),
      );
    });

    it("accepts a boolean, too", () => {
      const withCaching = store.withCaching(true);
      expect(withCaching("counter")).toBe(withCaching("counter"));

      const without = withCaching.withCaching(false);
      expect(without("counter")).not.toBe(without("counter"));
    });

    it("does not affect the source store object", () => {
      store.withCaching();
      expect(store("counter")).not.toBe(store("counter"));
    });
  });

  describe(".caches()", () => {
    it("indicates whether the store uses caching", () => {
      expect(store.caches()).toBe(false);
      expect(store.withCaching().caches()).toBe(true);
      expect(
        store
          .withCaching()("nested")
          .caches(),
      ).toBe(true);
      expect(
        store
          .withCaching(true)
          .withCaching(false)
          .caches(),
      ).toBe(false);
    });
  });

  describe(".refersToSameStateAs()", () => {
    it("works", () => {
      expect(store.refersToSameStateAs(store)).toBe(true);
      expect(
        store("counter").refersToSameStateAs(store("nested")("state")),
      ).toBe(false);
      expect(
        store("nested")("left").refersToSameStateAs(store("nested")("left")),
      ).toBe(true);
      expect(
        store("nested")("left").refersToSameStateAs(store("nested")("right")),
      ).toBe(false);
      expect(
        store.refersToSameStateAs(
          new AppStore(backingStore, "testKey", new State()),
        ),
      ).toBe(true);
      expect(
        store.refersToSameStateAs(
          new AppStore(backingStore, "testKey2", new State()),
        ),
      ).toBe(false);
    });
  });

  function getGlobalState() {
    let value: any;
    backingStore.pipe(take(1)).subscribe((v) => {
      value = v;
    });
    return value!;
  }
});
