import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppStore} from 'ng-app-state';
import {AuthState} from './auth-state';

@Injectable()
export class AuthStore extends AppStore<AuthState> {
  constructor(store: Store<any>) {
    super(store, 'auth', new AuthState());
  }
}
