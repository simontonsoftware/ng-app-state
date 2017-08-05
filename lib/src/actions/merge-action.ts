import {AppStateAction} from '../app-state-action';

export class MergeAction extends AppStateAction {
  constructor(path: string[], value: any) {
    super('merge', path, value);
  }

  protected getNewValue<T>(oldState: T) {
    return Object.assign({}, oldState, this.value);
  }
}
