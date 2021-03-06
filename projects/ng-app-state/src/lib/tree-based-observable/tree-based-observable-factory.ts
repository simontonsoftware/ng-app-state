import { get } from 'micro-dash';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { ObservableNode } from './observable-node';

/** @hidden */
const factories = new WeakMap<Observable<any>, TreeBasedObservableFactory>();

/** @hidden */
export class TreeBasedObservableFactory {
  private readonly root: ObservableNode;

  static getFor(source: Observable<any>): TreeBasedObservableFactory {
    let factory = factories.get(source);
    if (!factory) {
      factory = new TreeBasedObservableFactory(source);
      factories.set(source, factory);
    }
    return factory;
  }

  private constructor(source: Observable<any>) {
    this.root = new ObservableNode(
      source.pipe(
        tap((state) => {
          this.root.updateCache(state);
        }),
      ),
    );
  }

  getState$(path: string[]): Observable<any> {
    return this.ensureNodeAt(path);
  }

  getState(path: string[]): any {
    if (this.root.subscribersAreEmpty()) {
      this.root.pipe(take(1)).subscribe();
    }
    const rootState = this.root.getValue();
    return path.length ? get(rootState, path) : rootState;
  }

  private ensureNodeAt(path: string[]): ObservableNode {
    let node = this.root;
    for (const childKey of path) {
      const parent = node;
      node = parent.ensureChild(childKey);
    }
    return node;
  }
}
