import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/exhaustMap';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Effect, Actions } from '@ngrx/effects';

import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth-store';
import { StatusState } from '../state/auth-state';
import * as Auth from '../actions/auth';
import { Authenticate, User } from '../models/user';

@Injectable()
export class AuthEffects {
  @Effect({ dispatch: false })
  login$ = this.actions$
    .ofType(Auth.LOGIN)
    .map((action: Auth.Login) => action.payload)
    .do(auth => this.login(auth));

  @Effect({ dispatch: false })
  logout$ = this.actions$
    .ofType(Auth.LOGOUT)
    .do(() => {
      this.authStore('status').set(new StatusState());
    });

  @Effect({ dispatch: false })
  loginRedirect$ = this.actions$
    .ofType(Auth.LOGIN_REDIRECT, Auth.LOGOUT)
    .do(authed => {
      this.router.navigate(['/login']);
    });

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private authStore: AuthStore,
    private router: Router
  ) {}

  private login(auth: Authenticate) {
    this.authStore('loginPage').set({ error: null, pending: true });
    this.authService.login(auth).subscribe(
      user => this.onLoginSuccess(user),
      error => this.onLoginFailure(error)
    );
  }

  private onLoginSuccess(user: User) {
    this.authStore.set({
      status: { loggedIn: true, user },
      loginPage: { error: null, pending: false }
    });
    this.router.navigate(['/']);
  }

  private onLoginFailure(error: string) {
    this.authStore('loginPage').set({ error, pending: false });
  }
}
