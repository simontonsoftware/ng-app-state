import { Store } from "@ngrx/store";
import { AppStore } from "../public-api";

class State {
  a: number;
  b: string;
  obj: { c: Date };
  ary: Array<boolean>;
}

const store = new AppStore<State>({} as Store, "", new State());

// $ExpectType StoreObject<number>
store("a");
// $ExpectType StoreObject<{ c: Date; }>
store("obj");
// $ExpectType StoreObject<Date>
store("obj")("c");
// $ExpectType StoreObject<boolean[]>
store("ary");
// $ExpectType StoreObject<boolean>
store("ary")(1);
