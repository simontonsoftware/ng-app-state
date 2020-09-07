import { Subject } from 'rxjs';
import { ObservableNode } from './observable-node';

/** @hidden */
export class TreeBasedObservableFactory<T> {
  private emitter = new Subject();
  private root = new ObservableNode(this.emitter);

  constructor(state: T) {
    this.setState(state, false);
  }

  setState(state: T, emit: boolean): void {
    this.root.updateCache(state);
    if (emit) {
      this.emitter.next(state);
    }
  }

  getState$(path: string[]): ObservableNode {
    let node = this.root;
    for (const childKey of path) {
      const parent = node;
      node = parent.ensureChild(childKey);
    }
    return node;
  }
}
