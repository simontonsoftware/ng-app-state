import {Action, Store} from '@ngrx/store';
import {BatchAction} from './actions/batch-action';
import {DeleteAction} from './actions/delete-action';
import {MergeAction} from './actions/merge-action';
import {SetAction} from './actions/set-action';
import {Observable} from 'rxjs';
import {ExtensibleFunction} from './utils/extensible-function';

export interface StoreObject<T> {
  <K extends keyof T, C extends T[K] = T[K]>(attr: K): StoreObject<C>;
}

export class StoreObject<T> extends ExtensibleFunction {
  private _$: Observable<T>;

  protected constructor(
    private store: Store<T>,
    private path: string[],
    private dispatcher: { dispatch(action: Action): void; },
  ) {
    super(
      (prop: string) => new StoreObject(store, [...path, prop], dispatcher),
    );
  }

  public get $(): Observable<T> {
    if (!this._$) {
      this._$ = (this.store.select as any)(...this.path);
    }
    return this._$;
  }

  public batch(func: (state: StoreObject<T>) => void) {
    const batch = new BatchAction();
    func(new StoreObject(this.store, this.path, batch));
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
