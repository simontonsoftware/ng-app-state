import { Action } from "@ngrx/store";

export abstract class AppStateAction implements Action {
  type: string;

  constructor(name: string, protected path: string[], protected value?: any) {
    this.type = `[${name}] ${path.join(".")}`;
  }

  abstract execute<T extends Object>(state: T): T;
}
