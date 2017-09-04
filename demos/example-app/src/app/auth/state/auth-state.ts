import { User } from '../models/user';

export class AuthState {
  status = new StatusState();
  loginPage = new LoginPageState();
}

export class StatusState {
  loggedIn = false;
  user: User | null = null;
}

export class LoginPageState {
  error: string | null = null;
  pending = false;
}
