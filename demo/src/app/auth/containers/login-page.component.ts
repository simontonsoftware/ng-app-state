import { Component, OnInit } from '@angular/core';
import { Authenticate } from '../models/user';
import { AuthStore } from '../state/auth-store';
import * as Auth from '../actions/auth';

@Component({
  selector: 'bc-login-page',
  template: `
    <bc-login-form
      (submitted)="onSubmit($event)"
      [pending]="pending$ | async"
      [errorMessage]="error$ | async">
    </bc-login-form>
  `,
  styles: [],
})
export class LoginPageComponent implements OnInit {
  pending$ = this.authStore('loginPage')('pending').$;
  error$ = this.authStore('loginPage')('error').$;

  constructor(private authStore: AuthStore) {}

  ngOnInit() {}

  onSubmit($event: Authenticate) {
    this.authStore.dispatch(new Auth.Login($event));
  }
}
