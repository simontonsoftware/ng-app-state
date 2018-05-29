import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { noop, ObjectWith } from 'micro-dash';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppStore } from './app-store';
import { ngAppStateReducer } from './meta-reducer';
import { StoreObject } from './store-object';
import { TreeBasedObservableFactory } from './tree-based-observable-factory';

interface State {
  left?: State;
  right?: State;
}

const rootKey = 'testKey';

describe('TreeBasedObservableFactory', () => {
  let store: AppStore<State>;
  let cache: DebugCacheNode;

  beforeEach(() => {
    instrumentFactories();
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] })],
    });
    store = new AppStore(TestBed.get(Store), rootKey, {});
    cache = (store as any).observableFactory.rootCacheNode;
  });

  it('only emits from the exact level of a subscription', () => {
    subscribeTo('left');
    expectProfile({ count: 1, left: { count: 1 } });

    subscribeTo('left');
    expectProfile({ count: 1, left: { count: 2 } });

    subscribeTo('right', 'left', 'right');
    expectProfile({
      count: 2,
      left: { count: 2 },
      right: { count: 1, left: { count: 1, right: { count: 1 } } },
    });

    subscribeTo('right', 'left');
    expectProfile({
      count: 2,
      left: { count: 2 },
      right: { count: 1, left: { count: 2, right: { count: 1 } } },
    });
  });

  it(`multicasts through its cache node's observables`, () => {
    subscribeTo('left');
    subscribeTo('left', 'left');
    subscribeTo('right', 'right');
    expectProfile({
      count: 2,
      left: { count: 2, left: { count: 1 } },
      right: { count: 1, right: { count: 1 } },
    });

    store.set({});
    expectProfile({
      count: 4,
      left: { count: 2, left: { count: 1 } },
      right: { count: 1, right: { count: 1 } },
    });

    store('left').set({ right: {} });
    expectProfile({
      count: 6,
      left: { count: 4, left: { count: 1 } },
      right: { count: 1, right: { count: 1 } },
    });

    store<'left', State>('left')('left').set({});
    expectProfile({
      count: 8,
      left: { count: 6, left: { count: 2 } },
      right: { count: 1, right: { count: 1 } },
    });

    store('right').set({ left: {} });
    expectProfile({
      count: 10,
      left: { count: 6, left: { count: 2 } },
      right: { count: 2, right: { count: 1 } },
    });

    store<'right', State>('right')('right').set({});
    expectProfile({
      count: 12,
      left: { count: 6, left: { count: 2 } },
      right: { count: 3, right: { count: 2 } },
    });

    store.delete();
    expectProfile({
      count: 14,
      left: { count: 8, left: { count: 3 } },
      right: { count: 4, right: { count: 3 } },
    });
  });

  it('cleans up nodes and subscriptions', () => {
    const fullState = { left: { left: {}, right: {} } };

    const l = subscribeTo('left');
    const ll1 = subscribeTo('left', 'left');
    const ll2 = subscribeTo('left', 'left');
    const lr = subscribeTo('left', 'right');
    const rootNode = cache.children[rootKey];
    const lNode = rootNode.children.left;
    const llNode = lNode.children.left;
    const lrNode = lNode.children.right;
    expectProfile({
      count: 1,
      left: { count: 3, left: { count: 2 }, right: { count: 1 } },
    });

    l.unsubscribe();
    expectProfile({
      count: 1,
      left: { count: 3, left: { count: 2 }, right: { count: 1 } },
    });

    ll1.unsubscribe();
    store.set(fullState);
    expectProfile({
      count: 2,
      left: { count: 5, left: { count: 3 }, right: { count: 2 } },
    });

    ll2.unsubscribe();
    store.delete();
    expectProfile({
      count: 3,
      left: { count: 6, right: { count: 3 } },
    });
    expect(llNode.emitCount).toBe(3);

    lr.unsubscribe();
    store.set(fullState);
    expectProfile(undefined);
    expect(rootNode.emitCount).toBe(3);
    expect(lNode.emitCount).toBe(6);
    expect(llNode.emitCount).toBe(3);
    expect(lrNode.emitCount).toBe(3);
  });

  function subscribeTo(...path: Array<keyof State>) {
    let storeObject: StoreObject<State> = store;
    for (const key of path) {
      storeObject = storeObject(key);
    }
    return storeObject.$.subscribe(noop);
  }

  function expectProfile(profile: EmitProfile | undefined) {
    const rootNode = cache.children[rootKey];
    if (profile) {
      expect(buildCacheProfile(rootNode)).toEqual(profile);
    } else {
      expect(rootNode).toBeUndefined();
    }
  }

  function buildCacheProfile(node: DebugCacheNode) {
    const profile: EmitProfile = { count: node.emitCount };
    if (node.children.left) {
      profile.left = buildCacheProfile(node.children.left);
    }
    if (node.children.right) {
      profile.right = buildCacheProfile(node.children.right);
    }
    return profile;
  }
});

interface EmitProfile {
  count: number;
  left?: EmitProfile;
  right?: EmitProfile;
}

function instrumentFactories() {
  const prototypeAsAny: any = TreeBasedObservableFactory.prototype;
  const nodeFactory = prototypeAsAny.makeCacheNode;
  spyOn(prototypeAsAny, 'makeCacheNode').and.callFake(
    (observable: Observable<any>) => {
      let node: DebugCacheNode;
      observable = observable.pipe(
        tap(() => {
          ++node.emitCount;
        }),
      );
      node = nodeFactory(observable);
      node.emitCount = 0;
      return node;
    },
  );
}

interface DebugCacheNode {
  observable: Observable<any>;
  numSubscribers: number;
  children: ObjectWith<DebugCacheNode>;
  emitCount: number;
}
