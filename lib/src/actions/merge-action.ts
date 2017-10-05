import { merge } from 'micro-dash';
import { AppStateAction } from '../app-state-action';

export class MergeAction extends AppStateAction {
  constructor(path: string[], value: any) {
    super('merge', path, value);
  }

  protected getNewValue<T>(oldState: T) {
    return merge({}, oldState, this.value) as T;
  }
}
