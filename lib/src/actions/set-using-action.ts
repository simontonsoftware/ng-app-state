import { AppStateAction } from '../app-state-action';

export class SetUsingAction extends AppStateAction {
  constructor(path: string[], private func: Function, args: any[]) {
    super(`set:${func.name}`, path, args);
  }

  protected getNewValue<T>(oldState: T) {
    return this.func(oldState, ...this.value);
  }
}
