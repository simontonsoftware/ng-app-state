import { Action } from '@ngrx/store';

export interface Dispatcher {
 dispatch(action?: Action): void;
}
