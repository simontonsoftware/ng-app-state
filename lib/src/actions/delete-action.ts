import { omit } from 'micro-dash';
import { AppStateAction } from '../app-state-action';
import { Dispatcher } from '../dispatcher';

export class DeleteAction extends AppStateAction {
  constructor(dispatcher: Dispatcher, path: string[]) {
    super(dispatcher, 'delete', path);
  }

  protected getNewState<T extends object>(path: string[], oldState: T): T {
    if (path.length > 1) {
      return super.getNewState(path, oldState);
    } else {
      return omit(oldState, path[0] as keyof T) as T;
    }
  }
}
