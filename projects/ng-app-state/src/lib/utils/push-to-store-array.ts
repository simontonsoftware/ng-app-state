import { StoreObject } from "../store-object";

/**
 * Adds `item` to the end of the array in `store`. Returns a store object representing the newly added item.
 *
 * ```ts
 * declare const store: StoreObject<number[]>; // assume store starts with [1, 2]
 * const added = pushToStoreArray(store, 3); // store has [1, 2, 3]
 * add.set(17); // store has [1, 2, 17]
 * ```
 */
export function pushToStoreArray<T>(store: StoreObject<T[]>, item: T) {
  const itemStore = store(store.state().length);
  itemStore.set(item);
  return itemStore;
}
