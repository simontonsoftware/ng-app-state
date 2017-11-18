import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { skip } from 'rxjs/operators/skip';
import { AppStore } from '../app-store';
import { ngAppStateReducer } from '../meta-reducer';
import { StoreObject } from '../store-object';
import { UndoManager } from './undo-manager';

class State {
  counter = 0;
}

class TestImpl extends UndoManager<State, State> {
  private skipNextChange = false;

  constructor(store: AppStore<State>, maxDepth = 0) {
    super(store, maxDepth);
    store.$.pipe(skip(1)).subscribe(() => {
      if (this.skipNextChange) {
        this.skipNextChange = false;
      } else {
        this.pushCurrentState();
      }
    });
  }

  protected extractUndoState(state: State) {
    return state;
  }

  protected applyUndoState(
    undoState: State, batch: StoreObject<State>,
  ) {
    this.skipNextChange = true;
    batch.set(undoState);
  }
}

describe('UndoManager', () => {
  let store: AppStore<State>;
  let undoManager: TestImpl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, {metaReducers: [ngAppStateReducer]})],
    });
    inject([Store], (backingStore: Store<any>) => {
      store = new AppStore(backingStore, 'testKey', new State());
      undoManager = new TestImpl(store);
    })();
  });

  it('');

  describe('.canUndo()', () => {
    it('is false (only) when at the beginning of the stack', () => {
      expect(undoManager.canUndo()).toBe(false);

      store('counter').set(1);
      expect(undoManager.canUndo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canUndo()).toBe(false);

      undoManager.redo();
      expect(undoManager.canUndo()).toBe(true);

      store('counter').set(2);
      expect(undoManager.canUndo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canUndo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canUndo()).toBe(false);

      undoManager.redo();
      expect(undoManager.canUndo()).toBe(true);

      undoManager.reset();
      expect(undoManager.canUndo()).toBe(false);
    });
  });

  describe('.canRedo()', () => {
    it('is false (only) when at the end of the stack', () => {
      expect(undoManager.canRedo()).toBe(false);

      store('counter').set(1);
      expect(undoManager.canRedo()).toBe(false);

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.redo();
      expect(undoManager.canRedo()).toBe(false);

      store('counter').set(2);
      expect(undoManager.canRedo()).toBe(false);

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.redo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.redo();
      expect(undoManager.canRedo()).toBe(false);

      undoManager.reset();
      expect(undoManager.canRedo()).toBe(false);
    });
  });

  describe('.reset()', () => {
    it('does not affect the store', () => {
      undoManager.reset();
      expectStack(0);

      store('counter').set(1);
      undoManager.reset();
      expectStack(1);

      undoManager.reset();
      expectStack(1);
    });
  });

  describe('.pushCurrentState()', () => {
    it('adds to the stack', () => {
      undoManager.pushCurrentState();
      expectStack(0, 0);

      store('counter').set(1);
      undoManager.pushCurrentState();
      expectStack(0, 0, 1);

      undoManager.pushCurrentState();
      expectStack(0, 0, 1, 1);
    });

    it('clears the stack after the current index', () => {
      store('counter').set(1);
      store('counter').set(2);
      store('counter').set(3);
      expectStack(0, 1, 2, 3);

      undoManager.undo();
      undoManager.pushCurrentState();
      expectStack(0, 1, 2, 2);

      undoManager.undo();
      undoManager.undo();
      undoManager.pushCurrentState();
      expectStack(0, 1, 1);

      undoManager.undo();
      undoManager.undo();
      undoManager.pushCurrentState();
      expectStack(0, 0);
    });
  });

  describe('.undo()', () => {
    it('throws an error if at the beginning of the stack', () => {
      expect(() => { undoManager.undo(); }).toThrowError('Cannot undo');

      store('counter').set(1);
      undoManager.undo();
      expect(() => { undoManager.undo(); }).toThrowError('Cannot undo');

      undoManager.redo();
      store('counter').set(2);
      undoManager.undo();
      undoManager.undo();
      expect(() => { undoManager.undo(); }).toThrowError('Cannot undo');
    });
  });

  describe('.redo()', () => {
    it('throws an error if at the end of the stack', () => {
      expect(() => { undoManager.redo(); }).toThrowError('Cannot redo');

      store('counter').set(1);
      expect(() => { undoManager.redo(); }).toThrowError('Cannot redo');

      undoManager.undo();
      undoManager.redo();
      expect(() => { undoManager.redo(); }).toThrowError('Cannot redo');

      store('counter').set(2);
      undoManager.undo();
      undoManager.undo();
      undoManager.redo();
      undoManager.redo();
      expect(() => { undoManager.redo(); }).toThrowError('Cannot redo');
    });
  });

  describe('managing stack size', () => {
    it('respects `maxDepth` by default (when given)', () => {
      undoManager = new TestImpl(store, 2);
      store('counter').set(1);
      expectStack(0, 1);

      store('counter').set(2);
      expectStack(1, 2);

      store('counter').set(3);
      expectStack(2, 3);

      undoManager.undo();
      store('counter').set(4);
      expectStack(2, 4);

      store('counter').set(5);
      expectStack(4, 5);
    });

    it('respects `.isOverSize()` when overridden', () => {
      let numToDrop = 0;
      undoManager = new class extends TestImpl {
        constructor() {
          super(store, 2);
        }

        protected isOverSize(size: number) {
          if (numToDrop > 0) {
            --numToDrop;
            return true;
          } else {
            return false;
          }
        }
      };

      store('counter').set(1);
      store('counter').set(2);
      store('counter').set(3);
      expectStack(0, 1, 2, 3);

      numToDrop = 2;
      store('counter').set(4);
      expectStack(2, 3, 4);

      numToDrop = 999;
      store('counter').set(5);
      expectStack(5);
    });
  });

  function expectStack(...states: number[]) {
    while (undoManager.canUndo()) { undoManager.undo(); }

    const stack = [store.state().counter];
    while (undoManager.canRedo()) {
      undoManager.redo();
      stack.push(store.state().counter);
    }
    expect(stack).toEqual(states);
  }
});
