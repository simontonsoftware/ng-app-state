/** @hidden */
export abstract class AppStateAction {
  type: string;

  constructor(name: string, protected path: string[], protected value?: any) {
    this.type = `[${name}] ${path.join('.')}`;
  }

  abstract execute<T extends object>(rootState: T): T;
}
