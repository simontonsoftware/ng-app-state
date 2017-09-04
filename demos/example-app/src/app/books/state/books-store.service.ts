import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppStore } from 'ng-app-state';
import { BooksModuleState } from './books-state';

@Injectable()
export class BooksStore extends AppStore<BooksModuleState> {
  constructor(store: Store<any>) {
    super(store, 'books', new BooksModuleState());
  }
}
