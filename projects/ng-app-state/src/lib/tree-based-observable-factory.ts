import { get, ObjectWith } from "micro-dash";
import { Observable } from "rxjs";
import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
  take,
  tap,
} from "rxjs/operators";

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
      const subscription = this.incrementSubscribers(path).subscribe(
        subscriber,
      );
      return () => {
        subscription.unsubscribe();
        this.decrementSubscribers(path);
      };
    });
  }

  public getState(path: string[]) {
    return get(this.getCurrentState(), path);
  }

  private incrementSubscribers(path: string[]) {
    let cacheNode = this.rootCacheNode;
    for (let i = 0; i < path.length; ++i) {
      const key = path[i];
      let child = cacheNode.children[key];
      if (!child) {
        child = cacheNode.children[key] = this.makeCacheNode(
          this.makeChildObservable(cacheNode, path.slice(0, i + 1)),
        );
      }
      ++child.numSubscribers;
      cacheNode = child;
    }
    return cacheNode.observable;
  }

  private makeChildObservable(cacheNode: CacheNode, path: string[]) {
    return cacheNode.observable.pipe(
      map(() => this.getState(path)),
      distinctUntilChanged(),
      publishReplay(1),
      refCount(),
    );
  }

  private getCurrentState() {
    if (this.rootCacheNode.numSubscribers) {
      return this.lastSeenState;
    }

    let state: any;
    this.rootCacheNode.observable.pipe(take(1)).subscribe((value) => {
      state = value;
    });
    return state;
  }

  private decrementSubscribers(path: string[]) {
    let cacheNode = this.rootCacheNode;
    for (const key of path) {
      const child = cacheNode.children[key];
      if (!--child.numSubscribers) {
        delete cacheNode.children[key];
        return;
      }
      cacheNode = child;
    }
  }

  // an instance method so it can be spied on for tests
  private makeCacheNode(observable: Observable<any>): CacheNode {
    return {
      observable,
      numSubscribers: 0,
      children: {},
    };
  }
}

interface CacheNode {
  observable: Observable<any>;
  numSubscribers: number;
  children: ObjectWith<CacheNode>;
}
