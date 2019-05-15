import { get } from "micro-dash";
import { AppStateAction } from "./app-state-action";

/** @hidden */
export class BatchAction extends AppStateAction {
  private children: AppStateAction[] = [];

  constructor(private rootSnapshot: any) {
    super("batch", []);
  }

  public dispatch(action: AppStateAction) {
    this.children.push(action);
    this.rootSnapshot = action.execute(this.rootSnapshot);
  }

  public execute<T extends object>(rootState: T) {
    return this.rootSnapshot;
  }

  public getState(path: string[]) {
    return path.length ? get(this.rootSnapshot, path) : this.rootSnapshot;
  }
}
