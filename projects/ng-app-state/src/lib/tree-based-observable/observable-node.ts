import { forOwn, ObjectWith, pull } from "micro-dash";
import { Observable, Subscriber, Subscription } from "rxjs";

/** @hidden */
export class ObservableNode extends Observable<any> {
  private value: any;
  private valueChanged = false;
  private children: ObjectWith<ObservableNode> = {};
  private subscribers: Array<Subscriber<any>> = [];
  private sourceSubscription?: Subscription;

  /**
   * @param source expected to as if from a behavior, and only emit distinct values
   */
  constructor(private _source: Observable<any>, private cleanup: VoidFunction) {
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

  ensureChild(key: string, cleanup: VoidFunction) {
    let child = this.getChild(key);
    if (!child) {
      child = this.children[key] = new ObservableNode(this, cleanup);
      if (this.value) {
        child.value = this.value[key];
      }
    }
    return child;
  }

  getChild(key: string) {
    return this.children[key];
  }

  removeChild(key: string) {
    delete this.children[key];
  }

  updateCache(value: any) {
    if (this.value === value) {
      return;
    }

    this.value = value;
    this.valueChanged = true;
    forOwn(this.children, (child, key) => {
      child.updateCache(value ? value[key] : undefined);
    });
  }

  subscribersAreEmpty() {
    return this.subscribers.length === 0;
  }

  getCache() {
    return this.value;
  }

  private start() {
    this.sourceSubscription = this._source.subscribe(() => {
      if (this.valueChanged) {
        this.emit();
        this.valueChanged = false;
      }
    });
  }

  private emit() {
    for (const subscriber of this.subscribers) {
      subscriber.next(this.value);
    }
  }

  private stop() {
    this.sourceSubscription!.unsubscribe();
    this.cleanup();
  }
}
