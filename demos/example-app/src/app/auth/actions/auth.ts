import { Action } from '@ngrx/store';
import { Authenticate } from '../models/user';

export const LOGIN = '[Auth] Login';
export const LOGOUT = '[Auth] Logout';
export const LOGIN_REDIRECT = '[Auth] Login Redirect';

export class Login implements Action {
  readonly type = LOGIN;

  constructor(public payload: Authenticate) {}
}

export class LoginRedirect implements Action {
  readonly type = LOGIN_REDIRECT;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export type Actions =
  | Login
  | LoginRedirect
  | Logout;
