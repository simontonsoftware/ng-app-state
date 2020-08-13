import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { AppStore } from '../app-store';
import { ngAppStateReducer } from '../ng-app-state-reducer';
import { StoreObject } from '../store-object';
import { pushToStoreArray } from './push-to-store-array';

describe('pushToStoreArray', () => {
  let store: StoreObject<number[]>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] })],
    });
    const backingStore = TestBed.inject(Store);
    store = new AppStore(backingStore, 'testKey', [1, 2]);
  });

  it('adds the specified item to the store', () => {
    store.set([]);
    pushToStoreArray(store, 1);
    expect(store.state()).toEqual([1]);
    pushToStoreArray(store, 2);
    expect(store.state()).toEqual([1, 2]);
    pushToStoreArray(store, 17);
    expect(store.state()).toEqual([1, 2, 17]);
  });

  it('returns a store object representing the newly pushed item', () => {
    store.set([]);

    let added = pushToStoreArray(store, 1);
    added.set(2);
    expect(store.state()).toEqual([2]);

    added = pushToStoreArray(store, 17);
    added.set(-12);
    expect(store.state()).toEqual([2, -12]);
  });

  it('works within a batch (production bug)', () => {
    store.set([]);
    let so1: StoreObject<number>;
    let so2: StoreObject<number>;

    store.batch((batch) => {
      so1 = pushToStoreArray(batch, 1);
      so2 = pushToStoreArray(batch, 2);

      expect(so1.state()).toEqual(1);
      expect(so2.state()).toEqual(2);
    });
    expect(store.state()).toEqual([1, 2]);
    expect(so1!.state()).toEqual(1);
    expect(so2!.state()).toEqual(2);
  });
});
