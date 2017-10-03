import { merge } from 'micro-dash';
import { AppStateAction } from '../app-state-action';
import { Dispatcher } from '../dispatcher';

export class MergeAction extends AppStateAction {
  constructor(dispatcher: Dispatcher, path: string[], value: any) {
    super(dispatcher, 'merge', path, value);
  }

  protected getNewValue<T>(oldState: T) {
    return merge({}, oldState, this.value) as T;
  }
}
