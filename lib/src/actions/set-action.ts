import { AppStateAction } from '../app-state-action';

export class SetAction extends AppStateAction {
  constructor(path: string[], value: any) {
    super('set', path, value);
  }
}
