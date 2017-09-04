import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppStore } from 'ng-app-state';
import { CounterState } from './counter-state';

@Injectable()
export class CounterStore extends AppStore<CounterState> {
  constructor(store: Store<any>) {
    super(store, 'counterState', new CounterState());
  }
}
