import { AppStateAction } from '../app-state-action';
import { Dispatcher } from '../dispatcher';

export class SetAction extends AppStateAction {
  constructor(dispatcher: Dispatcher, path: string[], value: any) {
    super(dispatcher, 'set', path, value);
  }
}
