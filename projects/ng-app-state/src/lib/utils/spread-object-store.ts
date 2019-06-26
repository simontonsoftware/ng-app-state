import { keys } from "micro-dash";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { mapAndCacheObjectElements } from "s-rxjs-utils";
import { StoreObject } from "../store-object";

/**
 * Returns an observable that emits an array of store objects, one for each element in `source`'s state. The resulting arrays will have references to the exact store objects included in the previous emission when possible, making them performant to use in `*ngFor` expressions without the need to use `trackBy`.
 *
 * ```ts
 * interface HeroMap {
 *   [name: string]: Hero;
 * }
 *
 * @Component({
 *   template: `
 *     <hero
 *       *ngFor="let heroStore of heroStores$ | async"
 *       [heroStore]="heroStore"
 *     ></hero>
 *   `,
 * })
 * class HeroListComponent {
 *   heroStores$: Observable<Array<StoreObject<Hero>>>;
 *   @Input() private heroesStore: StoreObject<HeroMap>;
 *
 *   ngOnChanges() {
 *     this.heroStores$ = spreadObjectStore(this.heroesStore);
 *   }
 * }
 * ```
 */
export function spreadObjectStore$<T extends object>(
  source: StoreObject<T>,
): Observable<Array<StoreObject<T[keyof T]>>> {
  let lastKeySet: Set<string | keyof T> | undefined;
  return source.$.pipe(
    filter((value) => {
      const keySet = new Set(keys(value));
      if (lastKeySet && setsAreEqual(keySet, lastKeySet)) {
        return false;
      }

      lastKeySet = keySet;
      return true;
    }),
    mapAndCacheObjectElements(
      (_value, key) => key,
      (_value, key) => source(key as keyof T),
    ),
  );
}

function setsAreEqual<T>(s1: Set<T>, s2: Set<T>) {
  if (s1.size !== s2.size) {
    return false;
  }

  for (const item of s1) {
    if (!s2.has(item)) {
      return false;
    }
  }

  return true;
}
