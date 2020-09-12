import { Injectable } from '@angular/core';
import { RootStore, logToDevtools } from 'ng-app-state';
import { IntegrationState } from './integration-state';

@Injectable({ providedIn: 'root' })
export class IntegrationStore extends RootStore<IntegrationState> {
  constructor() {
    super(new IntegrationState());
    logToDevtools(this, { name: 'Integration store ' });
  }
}
