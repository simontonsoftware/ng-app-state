import {Action, Store} from '@ngrx/store';
import {BatchAction} from './actions/batch-action';
import {DeleteAction} from './actions/delete-action';
import {MergeAction} from './actions/merge-action';
import {SetAction} from './actions/set-action';
import {Observable} from 'rxjs';
import {ExtensibleFunction} from './utils/extensible-function';

export interface StateObject<T> {
  <K extends keyof T, C extends T[K] = T[K]>(attr: K): StateObject<C>;
}

export class StateObject<T> extends ExtensibleFunction {
  protected constructor(
    private store: Store<T>,
    private path: string[],
    private dispatcher: { dispatch(action: Action): void; },
  ) {
    super(
      (prop: string) => new StateObject(store, [...path, prop], dispatcher),
    );
  }

  public get $(): Observable<T> {
    return (this.store.select as any)(...this.path);
  }

  public batch(func: (state: StateObject<T>) => void) {
    const batch = new BatchAction();
    func(new StateObject(this.store, this.path, batch));
    this.dispatcher.dispatch(batch);
  }

  public set(value: T) {
    this.dispatcher.dispatch(new SetAction(this.path, value));
  }

  public merge(value: Partial<T>) {
    this.dispatcher.dispatch(new MergeAction(this.path, value));
  }

  public delete() {
    this.dispatcher.dispatch(new DeleteAction(this.path));
  }

  public value() {
    let value: T;
    this.$.take(1).subscribe((v) => value = v);
    return value!;
  }
}
