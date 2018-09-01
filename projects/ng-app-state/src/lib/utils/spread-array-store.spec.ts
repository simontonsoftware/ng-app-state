import { TestBed } from "@angular/core/testing";
import { Store, StoreModule } from "@ngrx/store";
import { AppStore } from "../app-store";
import { ngAppStateReducer } from "../meta-reducer";
import { StoreObject } from "../store-object";
import { spreadArrayStore$ } from "./spread-array-store";

describe("spreadArrayStore$()", () => {
  let store: StoreObject<number[]>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] })],
    });
    const backingStore = TestBed.get(Store);
    store = new AppStore(backingStore, "testKey", [1, 2]);
  });

  it("emits a separate store object for each element in the array", () => {
    store.set([1, 2]);
    let emitted: Array<StoreObject<number>>;
    spreadArrayStore$(store).subscribe((stores) => {
      emitted = stores;
    });
    expect(emitted!.length).toBe(2);
    expect(emitted![0].state()).toBe(1);
    expect(emitted![1].state()).toBe(2);

    store.set([3, 4, 5]);
    expect(emitted!.length).toBe(3);
    expect(emitted![0].state()).toBe(3);
    expect(emitted![1].state()).toBe(4);
    expect(emitted![2].state()).toBe(5);

    store.set([6]);
    expect(emitted!.length).toBe(1);
    expect(emitted![0].state()).toBe(6);

    store.set([]);
    expect(emitted!.length).toBe(0);
  });

  it("only emits when the length of the array changes", () => {
    store.set([1, 2]);
    let emitCount = 0;
    spreadArrayStore$(store).subscribe((stores) => {
      ++emitCount;
    });
    expect(emitCount).toBe(1);

    store.set([3, 4]);
    expect(emitCount).toBe(1);

    store.set([5, 6, 7]);
    expect(emitCount).toBe(2);
  });

  // this makes it nice for use in templates that use OnPush change detection
  it("emits the same object reference for indexes that remain", () => {
    store.set([1, 2]);
    let lastEmit: Array<StoreObject<number>>;
    let previousEmit: Array<StoreObject<number>>;
    spreadArrayStore$(store).subscribe((stores) => {
      previousEmit = lastEmit;
      lastEmit = stores;
    });

    store.set([3, 4, 5]);
    expect(lastEmit![0]).toBe(previousEmit![0]);
    expect(lastEmit![1]).toBe(previousEmit![1]);

    store.set([6]);
    expect(lastEmit![0]).toBe(previousEmit![0]);
  });
});
