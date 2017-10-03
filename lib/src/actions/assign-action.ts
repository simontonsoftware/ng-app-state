import {AppStateAction} from '../app-state-action';

export class AssignAction extends AppStateAction {
  constructor(rootKey: string, path: string[], value: any) {
    super('assign', rootKey, path, value);
  }

  protected getNewValue<T>(oldState: T) {
    return {...(oldState as any), ...this.value};
  }
}
