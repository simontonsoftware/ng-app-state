import { inject, TestBed } from "@angular/core/testing";
import { Action, Store, StoreModule } from "@ngrx/store";
import { take } from "rxjs/operators";
import { expectSingleCallAndReset } from "s-ng-test-utils";
import { AppStore } from "./app-store";
import { ngAppStateReducer } from "./ng-app-state-reducer";

describe("AppStore", () => {
  let backingStore: Store<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] })],
    });
    inject([Store], (s: Store<any>) => {
      backingStore = s;
    })();
  });

  it("uses the given constructor arguments", () => {
    const store = new AppStore(backingStore, "s", { initial: true });
    expect(getGlobalState()).toEqual({ s: { initial: true } });
  });

  it("can have multiple instances", () => {
    const store1 = new AppStore(backingStore, "s1", { firstValue: 1 });
    const store2 = new AppStore(backingStore, "s2", { secondValue: 1 });
    expect(getGlobalState()).toEqual({
      s1: { firstValue: 1 },
      s2: { secondValue: 1 },
    });

    store1("firstValue").set(2);
    store2("secondValue").set(3);
    expect(getGlobalState()).toEqual({
      s1: { firstValue: 2 },
      s2: { secondValue: 3 },
    });
  });

  it("can be deleted", () => {
    const store = new AppStore(backingStore, "s", { initial: true });
    expect(getGlobalState()).toEqual({ s: { initial: true } });

    store.delete();
    const globalState = getGlobalState();
    expect(globalState).toEqual({});
  });

  describe(".action$", () => {
    it("emits (only) events from this store", () => {
      const store1 = new AppStore(backingStore, "s1", {});
      const store1Next = jasmine.createSpy();
      store1.action$.subscribe(store1Next);

      const store2 = new AppStore(backingStore, "s2", {});
      const store2Next = jasmine.createSpy();
      store2.action$.subscribe(store2Next);

      const action = { type: "test action" };
      store1.dispatch(action);
      expectSingleCallAndReset(store1Next, action);
      expect(store2Next).not.toHaveBeenCalled();
    });
  });

  describe(".dispatch()", () => {
    it("forwards actions on to ngrx", () => {
      const store = new AppStore(backingStore, "s", {});

      let callCount = 0;
      backingStore.addReducer("testKey", (state = {}, action) => {
        if (action.type === "the action") {
          ++callCount;
        }
        return state;
      });
      store.dispatch({ type: "the action" });
      expect(callCount).toBe(1);
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
