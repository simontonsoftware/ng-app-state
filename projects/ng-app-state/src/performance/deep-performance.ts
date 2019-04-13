import { Subscription } from "rxjs";
import { StoreObject } from "../public_api";
import { CounterState } from "./counter-state";

export class DeepState extends CounterState {
  next?: DeepState;

  constructor(depth: number) {
    super();
    if (depth > 0) {
      this.next = new DeepState(depth - 1);
    }
  }
}

export function subscribeDeep(store: StoreObject<DeepState>) {
  const { depth } = analyze(store);
  const subscriptions: Subscription[] = [];

  const start = new Date().getTime();
  for (let i = depth; --i >= 0; store = store("next")) {
    subscriptions.push(store.$.subscribe());
  }
  const elapsed = new Date().getTime() - start;

  console.log("ms to subscribe deep:", elapsed);
  console.log(" - per subscription:", elapsed / depth);
  const subscription = new Subscription();
  for (const s of subscriptions.reverse()) {
    subscription.add(s);
  }
  return { elapsed, subscription };
}

export function runDeep(store: StoreObject<DeepState>, iterations: number) {
  const { leafStore } = analyze(store);

  const start = new Date().getTime();
  for (let i = iterations; --i >= 0; ) {
    leafStore("counter").setUsing(increment);
  }
  const elapsed = new Date().getTime() - start;

  console.log("ms to run deep:", elapsed);
  console.log(" - per iteration:", elapsed / iterations);
  return elapsed;
}

function analyze(store: StoreObject<DeepState>) {
  let depth = 1;
  for (; store("next").state(); ++depth) {
    store = store("next");
  }
  return { depth, leafStore: store };
}

function increment(n: number) {
  return n + 1;
}
