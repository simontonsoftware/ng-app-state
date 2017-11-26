import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { AppStore } from './app-store';
import { ngAppStateReducer } from './meta-reducer';
import { take } from 'rxjs/operators/take';

class State {
  counter = 0;
  nested = new InnerState();
  optional?: InnerState;
  array?: InnerState[];
}

class InnerState {
  left?: InnerState;
  right?: InnerState;

  constructor(public state = 0) {}
}

describe('StoreObject', () => {
  let backingStore: Store<any>;
  let store: AppStore<State>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, {metaReducers: [ngAppStateReducer]})],
    });
    inject([Store], (s: Store<any>) => { backingStore = s; })();
    store = new AppStore(backingStore, 'testKey', new State());
  });

  describe('()', () => {
    it('gives a useful error when used to modify missing state', () => {
      expect(() => {
        store<'optional', InnerState>('optional')('state').set(2);
      }).toThrowError(
        'testKey.optional is null or undefined (during [set] testKey.optional.state)',
      );
    });

    it('gives a useful error even when the root key is missing', () => {
      store.delete();
      expect(() => {
        store<'optional', InnerState>('optional')('state').set(2);
      }).toThrowError(
        'testKey is null or undefined (during [set] testKey.optional.state)',
      );
    })
  });

  describe('.$', () => {
    it('fires immediately, and with every change', () => {
      let rootFires = 0;
      let counterFires = 0;
      let nestedFires = 0;
      store.$.subscribe(() => { ++rootFires; });
      store('counter').$.subscribe(() => { ++counterFires; });
      store('nested').$.subscribe(() => { ++nestedFires; });
      expect(rootFires).toBe(1);
      expect(counterFires).toBe(1);
      expect(nestedFires).toBe(1);

      store('counter').set(5);
      expect(rootFires).toBe(2);
      expect(counterFires).toBe(2);

      store('nested')('state').set(15);
      expect(rootFires).toBe(3);
      expect(nestedFires).toBe(2);
    });

    it('gives the new value', () => {
      let lastValue: InnerState;
      store('nested').$.subscribe((value) => { lastValue = value; });
      expect(lastValue!).toBe(store.state().nested);
      expect(lastValue!).toEqual(new InnerState());

      let newValue = new InnerState(4);
      store('nested').set(newValue);
      expect(lastValue!).toBe(newValue);
      expect(lastValue!).toEqual(new InnerState(4));
    });

    it('gives undefined when a parent object is deleted', () => {
      let fires = 0;
      let lastValue: number | undefined;
      store<'optional', InnerState>('optional')('state').$.subscribe(
        (value) => {
          lastValue = value;
          ++fires;
        },
      );
      expect(fires).toBe(1);
      expect(lastValue).toBeUndefined();

      store('optional').set(new InnerState(17));
      expect(fires).toBe(2);
      expect(lastValue).toBe(17);

      store('optional').delete();
      expect(fires).toBe(3);
      expect(lastValue).toBeUndefined();
    });

    it('does not fire when parent objects change', () => {
      let counterFires = 0;
      let optionalFires = 0;
      store('counter').$.subscribe(() => { ++counterFires; });
      store<'optional', InnerState>('optional')('state').$.subscribe(
        (value) => { ++optionalFires; },
      );
      expect(counterFires).toBe(1);
      expect(optionalFires).toBe(1);

      store.delete();
      expect(counterFires).toBe(2);
      expect(optionalFires).toBe(1);

      store.set(new State());
      expect(counterFires).toBe(3);
      expect(optionalFires).toBe(1);

      store.set(new State());
      expect(counterFires).toBe(3);
      expect(optionalFires).toBe(1);

      store('optional').set(new InnerState());
      expect(counterFires).toBe(3);
      expect(optionalFires).toBe(2);
    });

    // This is important for use in angular templates, so each change detection cycle it gets the same object, so OnPush can work
    it('returns the same observable on successive calls', () => {
      const observable = store.$;
      expect(store.$).toBe(observable);

      store('counter').set(2);
      expect(store.$).toBe(observable);
    })
  });

  describe('.batch()', () => {
    it('causes a single update after multiple actions', () => {
      let fires = 0;
      store.$.subscribe(() => { ++fires; });
      expect(fires).toBe(1);

      store.batch((batch) => {
        batch('counter').set(3);
        batch('nested')('state').set(6);
        expect(fires).toBe(1);
      });

      expect(fires).toBe(2);
      expect(store.state()).toEqual({counter: 3, nested: {state: 6}});
    })
  });

  describe('.set()', () => {
    it('stores the exact object given', () => {
      const before = store.state().nested;
      const set = new InnerState();
      store('nested').set(set);
      const after = store.state().nested;

      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual(new InnerState());
    });

    it('works with undefined', () => {
      store('optional').set(new InnerState());
      expect(store.state().optional).not.toBeUndefined();
      store('optional').set(undefined);
      expect(store.state().optional).toBeUndefined();
    });

    it('works on the root object', () => {
      const before = store.state();
      const set = {
        counter: 2,
        nested: new InnerState(),
      };
      store.set(set);
      const after = store.state();

      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual({
        counter: 2,
        nested: new InnerState(),
      });
    });
  });

  describe('.assign()', () => {
    it('assigns the exact objects given', () => {
      const before = store.state().nested;
      const left = new InnerState();
      const right = new InnerState();
      store('nested').assign({left, right});
      const after = store.state().nested;

      expect(before).not.toBe(after);
      expect(before.left).toBeUndefined();
      expect(before.right).toBeUndefined();
      expect(after.left).toBe(left);
      expect(after.right).toBe(right);
    });
  });

  describe('.merge()', () => {
    it('merges in the objects given', () => {
      const o1 = new State();
      o1.counter = 1;
      o1.nested.left = new InnerState(2);
      store.merge(o1);
      expect(store.state()).toEqual({
        counter: 1,
        nested: {state: 0, left: new InnerState(2)},
      });

      const o2 = new State();
      o2.counter = 3;
      o2.nested.right = new InnerState(4);
      store.merge(o2);
      expect(store.state()).toEqual({
        counter: 3,
        nested: {state: 0, left: new InnerState(2), right: new InnerState(4)},
      });
    });
  });

  describe('.delete()', () => {
    it('removes sub-trees from the store', () => {
      store('optional').set(new InnerState());
      store<'optional', InnerState>('optional')('left').set(new InnerState());
      expect(store.state().optional!.left).toEqual(new InnerState());

      store<'optional', InnerState>('optional')('left').delete();
      expect(store.state().optional).not.toBe(undefined);
      expect(store.state().optional!.left).toBe(undefined);

      store('optional').delete();
      expect(getGlobalState().testKey).not.toBe(undefined);
      expect(store.state().optional).toBe(undefined);

      store.delete();
      expect(getGlobalState().testKey).toBe(undefined);
    });
  });

  describe('.dispatch()', () => {
    it('forwards actions on to ngrx', () => {
      let callCount = 0;
      backingStore.addReducer('testKey', (state = {}, action) => {
        if (action.type === 'the action') { ++callCount; }
        return state;
      });
      store.dispatch({type: 'the action'});
      expect(callCount).toBe(1);

      store('nested').dispatch({type: 'the action'});
      expect(callCount).toBe(2);

      store('counter').batch((batch) => {
        batch.dispatch({type: 'the action'});
        expect(callCount).toBe(3);
      });
      expect(callCount).toBe(3);
    });
  });

  function getGlobalState() {
    let value: any;
    backingStore.pipe(take(1)).subscribe((v) => { value = v; });
    return value!;
  }
});
