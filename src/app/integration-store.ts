import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppStore } from 'ng-app-state';
import { IntegrationState } from './integration-state';

@Injectable()
export class IntegrationStore extends AppStore<IntegrationState> {
  constructor(store: Store<any>) {
    super(store, 'state', new IntegrationState());
  }
}
