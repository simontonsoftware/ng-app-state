import { AppStateAction } from '../app-state-action';
import { clone } from 'micro-dash';

export class MutateUsingAction extends AppStateAction {
  constructor(path: string[], private func: Function, args: any[]) {
    super(`mutate:${func.name}`, path, args);
  }

  protected getNewValue<T>(oldState: T) {
    const newState = clone(oldState);
    this.func(newState, ...this.value);
    return newState;
  }
}
