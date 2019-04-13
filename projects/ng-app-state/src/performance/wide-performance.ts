import { times } from "micro-dash";
import { Subscription } from "rxjs";
import { StoreObject } from "../public_api";
import { CounterState } from "./counter-state";

export class WideState {
  array: CounterState[];

  constructor(width: number) {
    this.array = times(width, () => new CounterState());
  }
}

export function subscribeWide(store: StoreObject<WideState>) {
  const arrayStore = store("array");
  const width = arrayStore.state().length;
  const subscription = new Subscription();

  const start = new Date().getTime();
  for (let i = width; --i >= 0; ) {
    subscription.add(arrayStore(i)("counter").$.subscribe());
  }
  const elapsed = new Date().getTime() - start;

  console.log("ms to subscribe wide:", elapsed);
  console.log(" - per subscription:", elapsed / width);
  return { elapsed, subscription };
}

export function runWide(store: StoreObject<WideState>, iterations: number) {
  const counterStore = store("array")(0)("counter");

  const start = new Date().getTime();
  for (let i = iterations; --i; ) {
    counterStore.setUsing(increment);
  }
  const elapsed = new Date().getTime() - start;

  console.log("ms to run wide:", elapsed);
  console.log(" - per iteration:", elapsed / iterations);
  return elapsed;
}

function increment(n: number) {
  return n + 1;
}
