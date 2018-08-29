import { ActionReducer } from "@ngrx/store";
import { AppStateAction } from "./actions/app-state-action";

export function ngAppStateReducer(
  reducer: ActionReducer<any>,
): ActionReducer<any> {
  return (state, action) => {
    if (action instanceof AppStateAction) {
      state = action.execute(state);
    }
    return reducer(state, action);
  };
}
