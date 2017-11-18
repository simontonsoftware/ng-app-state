import { Action } from '@ngrx/store';
import { clone } from 'micro-dash';

export abstract class AppStateAction implements Action {
  public type: string;

  constructor(
    name: string,
    protected path: string[],
    protected value?: any,
  ) {
    this.type = `[${name}] ${path.join('.')}`;
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
    } else {
      return this.getNewValue(oldState);
    }
  }

  protected getNewValue<T>(oldValue: T): T {
    return this.value;
  }
}
