import { Action } from '@ngrx/store';
import { clone } from 'micro-dash';
import { Dispatcher } from './dispatcher';

export abstract class AppStateAction implements Action {
  public type: string;

  constructor(
    public dispatcher: Dispatcher,
    name: string,
    protected path: string[],
    protected value?: any,
  ) {
    this.type = `[${name}] ${path.join('.')}`;
  }

  public dispatch() {
    this.dispatcher.dispatch(this);
  }

  public execute<T extends object>(state: T) {
    return this.getNewState(this.path, state);
  }

  ///////

  protected getNewState<T extends object>(path: string[], oldState: T) {
    if (path.length) {
      if (oldState == null) {
        const parentPath = this.path.slice(0, path.length);
        throw new Error(
          `${this.type} failed: ${parentPath} is null or undefined`,
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
