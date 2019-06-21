import { get } from "micro-dash";
import { Observable } from "rxjs";
import { take, tap } from "rxjs/operators";
import { ObservableNode } from "./observable-node";

/** @hidden */
export class TreeBasedObservableFactory {
  private readonly root: ObservableNode;

  constructor(source: Observable<any>) {
    this.root = new ObservableNode(
      source.pipe(
        tap((state) => {
          this.root.updateCache(state);
        }),
      ),
    );
  }

  public get<T>(path: string[]): Observable<T> {
    return this.ensureNodeAt(path);
  }

  public getState(path: string[]) {
    if (this.root.subscribersAreEmpty()) {
      this.root.pipe(take(1)).subscribe();
    }
    const rootState = this.root.getValue();
    return path.length ? get(rootState, path) : rootState;
  }

  private ensureNodeAt(path: string[]) {
    let node = this.root;
    for (const childKey of path) {
      const parent = node;
      node = parent.ensureChild(childKey);
    }
    return node;
  }
}
