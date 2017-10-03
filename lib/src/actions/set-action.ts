import { AppStateAction } from '../app-state-action';

export class SetAction extends AppStateAction {
  constructor(rootKey: string, path: string[], value: any) {
    super('set', rootKey, path, value);
  }
}
