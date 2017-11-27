import { clone } from 'micro-dash';
import { AppStateAction } from './app-state-action';

export class FunctionAction extends AppStateAction {
  constructor(
    path: string[],
    private mutates: boolean,
    private func: Function,
    private args: any[],
  ) {
    super(`${mutates ? 'mutate' : 'set'}:${func.name}`, path);
  }

  public execute<T extends object>(state: T) {
    return this.getNewState(this.path, state);
  }

  ///////

  protected getNewState<T extends object>(path: string[], oldState: T) {
    if (path.length) {
      if (oldState == null) {
        throw new Error(
          this.path.slice(0, -path.length).join('.')
          + ` is null or undefined (during ${this.type})`,
        );
      }

      const key = path[0];
      const newState = clone(oldState);
      newState[key] = this.getNewState(path.slice(1), oldState[key]);
      return newState;
    } else if (this.mutates) {
      const newState = clone(oldState);
      this.func(newState, ...this.args);
      return newState;
    } else {
      return this.func(oldState, ...this.args);
    }
  }
}
