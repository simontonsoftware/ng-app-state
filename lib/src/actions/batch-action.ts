import {AppStateAction} from '../app-state-action';
import { Dispatcher } from '../dispatcher';

export class BatchAction extends AppStateAction {
  private children: AppStateAction[] = [];

  constructor(dispatcher: Dispatcher) {
    super(dispatcher, 'batch', []);
  }

  public dispatch(action?: AppStateAction) {
    if (action) {
      this.children.push(action);
    } else {
      super.dispatch();
    }
  }

  public execute<T extends object>(state: T) {
    return this.children.reduce(
      (curState, child) => child.execute(curState), state,
    );
  }
}
