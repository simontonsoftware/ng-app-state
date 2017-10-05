import { AppStateAction } from '../app-state-action';

export class BatchAction extends AppStateAction {
  private children: AppStateAction[] = [];

  constructor() {
    super('batch', []);
  }

  public dispatch(action: AppStateAction) {
    this.children.push(action);
  }

  public execute<T extends object>(state: T) {
    return this.children.reduce(
      (curState, child) => child.execute(curState), state,
    );
  }
}
