import { Injectable } from '@angular/core';
import { AppStore } from 'ng-app-state';
import { IntegrationState } from './integration-state';

@Injectable({ providedIn: 'root' })
export class IntegrationStore extends AppStore<IntegrationState> {
  constructor() {
    super(new IntegrationState());
  }
}
