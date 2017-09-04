import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import * as Auth from '../actions/auth';
import { AuthStore } from '../state/auth-store';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authStore: AuthStore) {}

  canActivate(): Observable<boolean> {
    return this.authStore('status')('loggedIn').$.take(1).map(authed => {
      if (!authed) {
        this.authStore.dispatch(new Auth.LoginRedirect());
        return false;
      }

      return true;
    });
  }
}
