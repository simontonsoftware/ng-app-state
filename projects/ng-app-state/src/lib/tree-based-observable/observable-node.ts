import { forOwn, pull } from 'micro-dash';
import { Observable, Subscriber, Subscription } from 'rxjs';

/** @hidden */
export class ObservableNode extends Observable<any> {
  private value: any;
  private valueChanged = false;
  private children: Record<string, Set<ObservableNode>> = {};
  private subscribers: Array<Subscriber<any>> = [];
  private sourceSubscription?: Subscription;

  constructor(
    private _source: Observable<any>,
    private key?: string,
    private parent?: ObservableNode,
  ) {
    super();
  }

  _subscribe(subscriber: Subscriber<any>) {
    if (this.subscribersAreEmpty()) {
      this.start();
    }
    subscriber.next(this.value);
    this.subscribers.push(subscriber);
    return () => {
      subscriber.unsubscribe();
      pull(this.subscribers, subscriber);
      if (this.subscribersAreEmpty()) {
        this.stop();
      }
    };
  }

  ensureChild(key: string) {
    const set = this.children[key];
    if (set?.size) {
      return set.values().next().value;
    } else {
      return new ObservableNode(this, key, this);
    }
  }

  updateCache(value: any) {
    if (this.value === value) {
      return;
    }

    this.value = value;
    this.valueChanged = true;
    forOwn(this.children, (children, key) => {
      for (const child of children) {
        child.updateCache(value ? value[key] : undefined);
      }
    });
  }

  subscribersAreEmpty() {
    return this.subscribers.length === 0;
  }

  getValue() {
    return this.value;
  }

  private start() {
    this.registerWithParent();
    this.sourceSubscription = this._source.subscribe(() => {
      if (this.valueChanged) {
        this.emit();
        this.valueChanged = false;
      }
    });
  }

  private emit() {
    for (const subscriber of this.subscribers.slice()) {
      subscriber.next(this.value);
    }
  }

  private stop() {
    this.sourceSubscription!.unsubscribe();
    if (this.key) {
      this.parent?.unregisterChild(this.key, this);
    }
  }

  private registerWithParent() {
    if (this.key) {
      this.parent?.registerChild(this.key, this);
    }
  }

  private registerChild(key: string, child: ObservableNode) {
    let set = this.children[key];
    if (!set) {
      set = this.children[key] = new Set<ObservableNode>();
    } else if (set.has(child)) {
      return;
    }

    set.add(child);
    this.registerWithParent();
    child.value = this.value ? this.value[key] : undefined;
  }

  private unregisterChild(key: string, child: ObservableNode) {
    const set = this.children[key];
    set.delete(child);
    if (set.size === 0) {
      delete this.children[key];
    }
  }
}
