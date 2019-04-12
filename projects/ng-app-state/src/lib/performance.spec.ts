import { TestBed } from "@angular/core/testing";
import { Store, StoreModule } from "@ngrx/store";
import { times } from "micro-dash";
import { AppStore } from "./app-store";
import { ngAppStateReducer } from "./meta-reducer";

const width = 1000;
const iterations = 10000;
const msPerIteration = 0.1;

class WideState {
  array = times(width, () => ({ counter: 0 }));
}

describe("performance", () => {
  it("is good with a wide array when one element changes", () => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] })],
    });
    const backingStore: Store<any> = TestBed.get(Store);
    const store = new AppStore(backingStore, "testKey", new WideState());
    for (let i = width; --i; ) {
      store("array")(i)("counter").$.subscribe();
    }

    const start = new Date().getTime();
    for (let i = iterations; --i >= 0; ) {
      store("array")(i % width)("counter").setUsing(increment);
    }
    const elapsed = new Date().getTime() - start;

    console.log("elapsed", elapsed);
    console.log("ms per iteration", elapsed / iterations);
    expect(elapsed / iterations).toBeLessThan(msPerIteration);
  });
});

function increment(n: number) {
  return n + 1;
}
