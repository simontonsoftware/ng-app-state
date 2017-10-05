import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { AppStore } from './app-store';
import { ngAppStateReducer } from './meta-reducer';

describe('AppStore', () => {
  let backingStore: Store<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, {metaReducers: [ngAppStateReducer]})]
    });
    inject([Store], (s: Store<any>) => { backingStore = s; })();
  });

  it('uses the given constructor arguments', () => {
    const store = new AppStore(backingStore, 's', {initial: true});
    expect(getState()).toEqual({s: {initial: true}});
  });

  it('can have multiple instances', () => {
    const store1 = new AppStore(backingStore, 's1', {firstValue: 1});
    const store2 = new AppStore(backingStore, 's2', {secondValue: 1});
    expect(getState()).toEqual({s1: {firstValue: 1}, s2: {secondValue: 1}});

    store1('firstValue').set(2);
    store2('secondValue').set(3);
    expect(getState()).toEqual({s1: {firstValue: 2}, s2: {secondValue: 3}});
  });

  it('can be deleted', () => {
    const store = new AppStore(backingStore, 's', {initial: true});
    expect(getState()).toEqual({s: {initial: true}});

    store.delete();
    expect(getState()).toEqual({});
  });

  function getState() {
    let value: any;
    backingStore.take(1).subscribe((v) => { value = v; });
    return value!;
  }
});
