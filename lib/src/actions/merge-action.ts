import { merge } from 'micro-dash';
import { AppStateAction } from '../app-state-action';

export class MergeAction extends AppStateAction {
  constructor(rootKey: string, path: string[], value: any) {
    super('merge', rootKey, path, value);
  }

  protected getNewValue<T>(oldState: T) {
    return merge({}, oldState, this.value) as T;
  }
}
