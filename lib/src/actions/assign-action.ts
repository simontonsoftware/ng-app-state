import {AppStateAction} from '../app-state-action';
import { Dispatcher } from '../dispatcher';

export class AssignAction extends AppStateAction {
  constructor(dispatcher: Dispatcher, path: string[], value: any) {
    super(dispatcher, 'assign', path, value);
  }

  protected getNewValue<T>(oldState: T) {
    return {...(oldState as any), ...this.value};
  }
}
