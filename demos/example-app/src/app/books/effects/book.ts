import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeUntil';
import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Scheduler } from 'rxjs/Scheduler';
import { async } from 'rxjs/scheduler/async';
import { empty } from 'rxjs/observable/empty';

import { GoogleBooksService } from '../../core/services/google-books';
import * as book from '../actions/book';
import { Book } from '../models/book';
import { BooksStore } from '../state/books-store.service';
import { BooksState } from '../state/books-state';
import { StoreObject } from 'ng-app-state';

export const SEARCH_DEBOUNCE = new InjectionToken<number>('Search Debounce');
export const SEARCH_SCHEDULER = new InjectionToken<Scheduler>(
  'Search Scheduler'
);

/**
 * Effects offer a way to isolate and easily test side-effects within your
 * application.
 * The `toPayload` helper function returns just
 * the payload of the currently dispatched action, useful in
 * instances where the current state is not necessary.
 *
 * Documentation on `toPayload` can be found here:
 * https://github.com/ngrx/platform/blob/master/docs/effects/api.md#topayload
 *
 * If you are unfamiliar with the operators being used in these examples, please
 * check out the sources below:
 *
 * Official Docs: http://reactivex.io/rxjs/manual/overview.html#categories-of-operators
 * RxJS 5 Operators By Example: https://gist.github.com/btroncone/d6cf141d6f2c00dc6b35
 */

@Injectable()
export class BookEffects {
  @Effect({ dispatch: false })
  search$ = this.actions$
    .ofType(book.SEARCH)
    .map(toPayload)
    .do((query) => this.onSearchStarted(query))
    .debounceTime(this.debounce, this.scheduler || async)
    .switchMap(query => {
      if (query === '') {
        return empty();
      }

      const nextSearch$ = this.actions$.ofType(book.SEARCH).skip(1);

      return this.googleBooks
        .searchBooks(query)
        .takeUntil(nextSearch$)
        .do(
          books => this.onSearchComplete(books),
          () => this.onSearchComplete([]),
        );
    });

  @Effect({ dispatch: false })
  load$ = this.actions$
    .ofType(book.LOAD)
    .map(toPayload)
    .do(book => this.onBookLoad(book));

  constructor(
    private actions$: Actions,
    private googleBooks: GoogleBooksService,
    @Optional()
    @Inject(SEARCH_DEBOUNCE)
    private debounce: number = 300,
    /**
       * You inject an optional Scheduler that will be undefined
       * in normal application usage, but its injected here so that you can mock out
       * during testing using the RxJS TestScheduler for simulating passages of time.
       */
    @Optional()
    @Inject(SEARCH_SCHEDULER)
    private scheduler: Scheduler,
    private booksStore: BooksStore,
  ) {}

  private onSearchStarted(query: string) {
    this.
    this.booksStore('search')
  }

  private onSearchComplete(books: Book[]) {
    const state = this.booksStore('books').state();
    const newBooks = books.filter(book => !state.entities[book.id]);

    const newBookIds = newBooks.map(book => book.id);
    const newBookEntities = newBooks.reduce(
      (entities, book) => {
        return Object.assign(entities, {
          [book.id]: book,
        });
      },
      {} as Book,
    );

    this.booksStore('books').set({
      ids: [...state.ids, ...newBookIds],
      entities: Object.assign({}, state.entities, newBookEntities),
      selectedBookId: state.selectedBookId,
    });
  }

  private onBookLoad(book: Book) {
    const state = this.booksStore('books').state();
    if (state.ids.indexOf(book.id) > -1) {
      return;
    }

    this.booksStore('books').set({
      ids: [...state.ids, book.id],
      entities: Object.assign({}, state.entities, {
        [book.id]: book,
      }),
      selectedBookId: state.selectedBookId,
    });
  }
}
