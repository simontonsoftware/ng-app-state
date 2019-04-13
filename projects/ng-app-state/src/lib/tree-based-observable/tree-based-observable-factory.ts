import { get, noop } from "micro-dash";
import { Observable } from "rxjs";
import { take, tap } from "rxjs/operators";
import { ObservableNode } from "./observable-node";

/** @private */
export class TreeBasedObservableFactory {
  private readonly root: ObservableNode;

  constructor(source: Observable<any>) {
    this.root = new ObservableNode(
      source.pipe(
        tap((state) => {
          this.root.updateCache(state);
        }),
      ),
      noop,
    );
  }

  public get<T>(path: string[]): Observable<T> {
    return this.ensureNodeAt(path);
  }

  public getState(path: string[]) {
    return get(this.getRootState(), path);
  }

  private ensureNodeAt(path: string[]) {
    let node = this.root;
    for (const childKey of path) {
      const parent = node;
      node = parent.ensureChild(childKey, () => {
        parent.removeChild(childKey);
      });
    }
    return node;
  }

  private getRootState() {
    if (this.root.subscribersAreEmpty()) {
      this.root.pipe(take(1)).subscribe();
    }
    return this.root.getCache();
  }
}
