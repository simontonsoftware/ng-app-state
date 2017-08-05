import 'rxjs/add/operator/let';
import { Observable } from 'rxjs/Observable';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { StoreObject } from 'ng-app-state';

import * as fromRoot from '../../reducers';
import * as fromAuth from '../../auth/reducers';
import { LayoutStore } from '../state/layout-store.service';
import * as Auth from '../../auth/actions/auth';

@Component({
  selector: 'bc-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bc-layout>
      <bc-sidenav [open]="showSidenav.$ | async">
        <bc-nav-item (activate)="closeSidenav()" *ngIf="loggedIn$ | async" routerLink="/" icon="book" hint="View your book collection">
          My Collection
        </bc-nav-item>
        <bc-nav-item (activate)="closeSidenav()" *ngIf="loggedIn$ | async" routerLink="/books/find" icon="search" hint="Find your next book!">
          Browse Books
        </bc-nav-item>
        <bc-nav-item (activate)="closeSidenav()" *ngIf="!(loggedIn$ | async)">
          Sign In
        </bc-nav-item>        
        <bc-nav-item (activate)="logout()" *ngIf="loggedIn$ | async">
          Sign Out
        </bc-nav-item>
      </bc-sidenav>
      <bc-toolbar (openMenu)="openSidenav()">
        Book Collection
      </bc-toolbar>

      <router-outlet></router-outlet>
    </bc-layout>
  `,
})
export class AppComponent {
  showSidenav: StoreObject<boolean>;
  loggedIn$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>, layoutStore: LayoutStore) {
    /**
     * Select a subtree of any `StoreObject` by calling it as a function.
     */
    this.showSidenav = layoutStore('showSidenav');
    this.loggedIn$ = this.store.select(fromAuth.getLoggedIn);
  }

  closeSidenav() {
    /**
     * All state updates are handled through `AppStore` subclasses.
     */
    this.showSidenav.set(false);
  }

  openSidenav() {
    this.showSidenav.set(true);
  }

  logout() {
    this.closeSidenav();

    this.store.dispatch(new Auth.Logout());
  }
}
