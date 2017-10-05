import { Action, ActionReducer } from '@ngrx/store';
import { AppStateAction } from './app-state-action';

export function ngAppStateReducer(
  reducer: ActionReducer<any>,
): ActionReducer<any> {
  return function(state, action) {
    if (action instanceof AppStateAction) { state = action.execute(state); }
    return reducer(state, action);
  };
}
