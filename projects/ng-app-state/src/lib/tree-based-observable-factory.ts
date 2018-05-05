import { isNil, ObjectWith } from 'micro-dash';
import { Observable } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
} from 'rxjs/operators';

export class TreeBasedObservableFactory {
  private rootCacheNode: CacheNode;

  constructor(source: Observable<any>) {
    this.rootCacheNode = this.makeCacheNode(source);
  }

  public get<T>(path: string[]): Observable<T> {
    const _this = this;
    return new Observable(function(subscriber) {
      const subscription = _this
        .incrementSubscribers(path)
        .subscribe(subscriber);
      return () => {
        subscription.unsubscribe();
        _this.decrementSubscribers(path);
      };
    });
  }

  private incrementSubscribers(path: string[]) {
    let cacheNode = this.rootCacheNode;
    for (const key of path) {
      let child = cacheNode.children[key];
      if (!child) {
        child = cacheNode.children[key] = this.makeCacheNode(
          cacheNode.observable.pipe(
            map((value) => (isNil(value) ? undefined : value[key])),
            distinctUntilChanged(),
            publishReplay(1),
            refCount(),
          ),
        );
      }
      ++child.numSubscribers;
      cacheNode = child;
    }
    return cacheNode.observable;
  }

  private decrementSubscribers(path: string[]) {
    let cacheNode = this.rootCacheNode;
    for (const key of path) {
      let child = cacheNode.children[key];
      if (!--child.numSubscribers) {
        delete cacheNode.children[key];
        return;
      }
      cacheNode = child;
    }
  }

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
