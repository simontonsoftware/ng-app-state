import {Book} from '../models/book';

export class BooksModuleState {
  search = new SearchState();
  books = new BooksState();
  collection = new CollectionState();
}

export class SearchState {
  ids: string[] = [];
  loading = false;
  query = '';
}

export class BooksState {
  ids: string[] = [];
  entities: { [id: string]: Book } = {};
  selectedBookId: string | null = null;
}

export class CollectionState {
  loaded = false;
  loading = false;
  ids: string[] = [];
}
