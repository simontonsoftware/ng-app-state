import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppStore } from 'ng-app-state';
import { LayoutState } from './layout-state';

@Injectable()
export class LayoutStore extends AppStore<LayoutState> {
  constructor(store: Store<any>) {
    super(store, 'layout', new LayoutState());
  }
}
