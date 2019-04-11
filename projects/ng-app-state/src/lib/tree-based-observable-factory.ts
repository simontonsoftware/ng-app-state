import { get, ObjectWith } from "micro-dash";
import { Observable } from "rxjs";
import {
  distinctUntilChanged,
  map,
  share,
  startWith,
  take,
  tap,
} from "rxjs/operators";

/** @private */
export class TreeBasedObservableFactory {
  private readonly rootCacheNode: CacheNode;
  private lastSeenState: any;

  constructor(source: Observable<any>) {
    this.rootCacheNode = this.makeCacheNode(
      source.pipe(
        tap((state) => {
          this.lastSeenState = state;
        }),
      ),
    );
  }

  public get<T>(path: string[]): Observable<T> {
    return new Observable((subscriber) => {
      this.ensureObservableAt(path).subscribe(subscriber);
      this.incrementSubscribers(path);
      return () => {
        subscriber.unsubscribe();
        this.decrementSubscribersAndTrimTree(path);
      };
    });
  }

  public getState(path: string[]) {
    return get(this.getRootState(), path);
  }

  private ensureObservableAt(path: string[]) {
    return this.walkPath(path, (node, i) => {
      const nextKey = path[i + 1];
      if (!node.children[nextKey]) {
        node.children[nextKey] = this.makeCacheNode(
          this.makeChildObservable(node, path.slice(0, i + 2)),
        );
      }
    })!.observable;
  }

  private incrementSubscribers(path: string[]) {
    this.walkPath(path, (node) => {
      ++node.numSubscribers;
    });
  }

  private makeChildObservable(cacheNode: CacheNode, path: string[]) {
    const multicaster = cacheNode.observable.pipe(
      map(() => this.getState(path)),
      share(),
    );
    return new Observable((subscriber) =>
      multicaster
        .pipe(
          startWith(this.getState(path)),
          distinctUntilChanged(),
        )
        .subscribe(subscriber),
    );
  }

  private getRootState() {
    if (this.rootCacheNode.numSubscribers) {
      return this.lastSeenState;
    }

    let state: any;
    this.rootCacheNode.observable.pipe(take(1)).subscribe((value) => {
      state = value;
    });
    return state;
  }

  private decrementSubscribersAndTrimTree(path: string[]) {
    this.walkPath(path, (node, i) => {
      --node.numSubscribers;
      const nextNode = node.children[path[i + 1]];
      if (nextNode && nextNode.numSubscribers === 1) {
        delete node.children[path[i + 1]];
      }
    });
  }

  private walkPath(path: string[], fn: (node: CacheNode, i: number) => void) {
    for (let i = -1, node = this.rootCacheNode; node; ) {
      fn(node, i);
      if (++i === path.length) {
        return node;
      }
      node = node.children[path[i]];
    }
  }

  // an instance method so it can be spied on for tests
  private makeCacheNode(observable: Observable<any>): CacheNode {
    return { observable, numSubscribers: 0, children: {} };
  }
}

interface CacheNode {
  observable: Observable<any>;
  numSubscribers: number;
  children: ObjectWith<CacheNode>;
}
