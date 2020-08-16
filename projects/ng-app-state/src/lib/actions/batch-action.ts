import { get } from 'micro-dash';
import { AppStateAction } from './app-state-action';

/** @hidden */
export class BatchAction extends AppStateAction {
  private children: AppStateAction[] = [];

  constructor(private rootSnapshot: any) {
    super('batch', []);
  }

  dispatch(action: AppStateAction): void {
    this.children.push(action);
    this.rootSnapshot = action.execute(this.rootSnapshot);
  }

  execute(): any {
    return this.rootSnapshot;
  }

  getState(path: string[]): any {
    return path.length ? get(this.rootSnapshot, path) : this.rootSnapshot;
  }
}
