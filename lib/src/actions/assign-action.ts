import {AppStateAction} from '../app-state-action';

export class AssignAction extends AppStateAction {
  constructor(path: string[], value: any) {
    super('assign', path, value);
  }

  protected getNewValue<T>(oldState: T) {
    return {...(oldState as any), ...this.value};
  }
}
