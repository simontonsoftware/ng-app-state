import { inject, TestBed } from "@angular/core/testing";
import { Store, StoreModule } from "@ngrx/store";
import { AppStore } from "../app-store";
import { ngAppStateReducer } from "../meta-reducer";
import { StoreObject } from "../store-object";
import { UndoManager, UndoOrRedo } from "./undo-manager";

class State {
  counter = 0;
  object?: any;
}

class TestImpl extends UndoManager<State, State> {
  lastApplicationUndoOrRedo?: UndoOrRedo;
  lastApplicationOldState?: State;
  private skipNextChange = true;

  constructor(store: AppStore<State>, maxDepth = 0) {
    super(store, maxDepth);
    store.$.subscribe(() => {
      if (this.skipNextChange) {
        this.skipNextChange = false;
      } else {
        this.pushCurrentState();
      }
    });
  }

  shouldPush(state: State) {
    return super.shouldPush(state);
  }

  protected extractUndoState(state: State) {
    return state;
  }

  protected applyUndoState(
    newState: State,
    batch: StoreObject<State>,
    undoOrRedo: UndoOrRedo,
    oldState: State,
  ) {
    this.skipNextChange = true;
    batch.set(newState);
    this.lastApplicationUndoOrRedo = undoOrRedo;
    this.lastApplicationOldState = oldState;
  }
}

describe("UndoManager", () => {
  let store: AppStore<State>;
  let undoManager: TestImpl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] })],
    });
    inject([Store], (backingStore: Store<any>) => {
      store = new AppStore(backingStore, "testKey", new State());
      undoManager = new TestImpl(store);
    })();
  });

  describe(".canUndo()", () => {
    it("is false (only) when at the beginning of the stack", () => {
      expect(undoManager.canUndo()).toBe(false);

      store("counter").set(1);
      expect(undoManager.canUndo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canUndo()).toBe(false);

      undoManager.redo();
      expect(undoManager.canUndo()).toBe(true);

      store("counter").set(2);
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

  describe(".canRedo()", () => {
    it("is false (only) when at the end of the stack", () => {
      expect(undoManager.canRedo()).toBe(false);

      store("counter").set(1);
      expect(undoManager.canRedo()).toBe(false);

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.redo();
      expect(undoManager.canRedo()).toBe(false);

      store("counter").set(2);
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

  describe(".canUndo$", () => {
    it("fires (only) when undoability changes", () => {
      let callCount = 0;
      let lastValue = false;
      undoManager.canUndo$.subscribe((value) => {
        ++callCount;
        lastValue = value;
      });
      expect(callCount).toBe(1);
      expect(lastValue).toBe(false);

      store("counter").set(1);
      expect(callCount).toBe(2);
      expect(lastValue).toBe(true);

      undoManager.undo();
      expect(callCount).toBe(3);
      expect(lastValue).toBe(false);

      undoManager.redo();
      expect(callCount).toBe(4);
      expect(lastValue).toBe(true);

      store("counter").set(2);
      undoManager.undo();
      expect(callCount).toBe(4);

      undoManager.undo();
      expect(callCount).toBe(5);
      expect(lastValue).toBe(false);

      undoManager.redo();
      expect(callCount).toBe(6);
      expect(lastValue).toBe(true);

      undoManager.reset();
      expect(callCount).toBe(7);
      expect(lastValue).toBe(false);
    });

    it("fires immediately with the current value", () => {
      store("counter").set(1);

      let callCount = 0;
      let lastValue = false;
      undoManager.canUndo$.subscribe((value) => {
        ++callCount;
        lastValue = value;
      });
      expect(callCount).toBe(1);
      expect(lastValue).toBe(true);

      undoManager.undo();
      expect(callCount).toBe(2);
      expect(lastValue).toBe(false);
    });
  });

  describe(".canRedo$", () => {
    it("fires (only) when redoability changes", () => {
      let callCount = 0;
      let lastValue = false;
      undoManager.canRedo$.subscribe((value) => {
        ++callCount;
        lastValue = value;
      });
      expect(callCount).toBe(1);
      expect(lastValue).toBe(false);

      store("counter").set(1);
      expect(callCount).toBe(1);

      undoManager.undo();
      expect(callCount).toBe(2);
      expect(lastValue).toBe(true);

      undoManager.redo();
      expect(callCount).toBe(3);
      expect(lastValue).toBe(false);

      store("counter").set(2);
      expect(callCount).toBe(3);

      undoManager.undo();
      expect(callCount).toBe(4);
      expect(lastValue).toBe(true);

      undoManager.undo();
      undoManager.redo();
      expect(callCount).toBe(4);

      undoManager.redo();
      expect(callCount).toBe(5);
      expect(lastValue).toBe(false);

      undoManager.reset();
      expect(callCount).toBe(5);
    });

    it("fires immediately with the current value", () => {
      store("counter").set(1);

      let callCount = 0;
      let lastValue = false;
      undoManager.canRedo$.subscribe((value) => {
        ++callCount;
        lastValue = value;
      });
      expect(callCount).toBe(1);
      expect(lastValue).toBe(false);

      undoManager.undo();
      expect(callCount).toBe(2);
      expect(lastValue).toBe(true);
    });
  });

  describe(".state$", () => {
    it("fires (only) when the state changes", () => {
      let callCount = 0;
      let lastValue = {} as State;
      undoManager.state$.subscribe((state) => {
        ++callCount;
        lastValue = state;
      });
      expect(callCount).toBe(1);
      expect(lastValue).toEqual(new State());

      store("counter").set(1);
      expect(callCount).toBe(2);
      expect(lastValue).toEqual({ counter: 1 });

      undoManager.undo();
      expect(callCount).toBe(3);
      expect(lastValue).toEqual(new State());

      undoManager.redo();
      expect(callCount).toBe(4);
      expect(lastValue).toEqual({ counter: 1 });

      store("counter").set(10);
      expect(callCount).toBe(5);
      expect(lastValue).toEqual({ counter: 10 });

      undoManager.reset();
      expect(callCount).toBe(5);
    });

    it("fires immediately with the current value", () => {
      store("counter").set(1);

      let callCount = 0;
      let lastValue = new State();
      undoManager.state$.subscribe((value) => {
        ++callCount;
        lastValue = value;
      });
      expect(callCount).toBe(1);
      expect(lastValue).toEqual({ counter: 1 });

      undoManager.undo();
      expect(callCount).toBe(2);
      expect(lastValue).toEqual(new State());
    });
  });

  describe(".reset()", () => {
    // most of `.reset()` is tested within the `.can[Un/Re]do()` blocks above

    it("does not affect the store", () => {
      undoManager.reset();
      expect(store.state().counter).toBe(0);

      store("counter").set(1);
      undoManager.reset();
      expect(store.state().counter).toBe(1);

      undoManager.reset();
      expect(store.state().counter).toBe(1);
    });
  });

  describe(".pushCurrentState()", () => {
    it("adds to the stack", () => {
      undoManager.pushCurrentState();
      expectStack(0, 0);

      store("counter").set(1);
      expectStack(0, 0, 1);
      undoManager.pushCurrentState();
      expectStack(0, 0, 1, 1);

      undoManager.pushCurrentState();
      expectStack(0, 0, 1, 1, 1);
    });

    it("clears the stack after the current index", () => {
      store("counter").set(1);
      store("counter").set(2);
      store("counter").set(3);
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

  describe(".undo()", () => {
    it("undoes, giving the correct arguments to the subclass", () => {
      store("counter").set(1);
      store("counter").set(2);
      expect(undoManager.lastApplicationUndoOrRedo).toBeUndefined();
      expect(undoManager.lastApplicationOldState).toBeUndefined();

      undoManager.undo();
      expect(store.state()).toEqual({ counter: 1 });
      expect(undoManager.lastApplicationUndoOrRedo).toEqual("undo");
      expect(undoManager.lastApplicationOldState).toEqual({ counter: 2 });

      undoManager.undo();
      expect(store.state()).toEqual(new State());
      expect(undoManager.lastApplicationUndoOrRedo).toEqual("undo");
      expect(undoManager.lastApplicationOldState).toEqual({ counter: 1 });
    });

    it("throws an error if at the beginning of the stack", () => {
      expect(() => {
        undoManager.undo();
      }).toThrowError("Cannot undo");

      store("counter").set(1);
      undoManager.undo();
      expect(() => {
        undoManager.undo();
      }).toThrowError("Cannot undo");

      undoManager.redo();
      store("counter").set(2);
      undoManager.undo();
      undoManager.undo();
      expect(() => {
        undoManager.undo();
      }).toThrowError("Cannot undo");
    });
  });

  describe(".redo()", () => {
    it("redoes, giving the correct arguments to the subclass", () => {
      store("counter").set(1);
      store("counter").set(2);
      undoManager.undo();
      undoManager.undo();

      undoManager.redo();
      expect(store.state()).toEqual({ counter: 1 });
      expect(undoManager.lastApplicationUndoOrRedo).toEqual("redo");
      expect(undoManager.lastApplicationOldState).toEqual(new State());

      undoManager.redo();
      expect(store.state()).toEqual({ counter: 2 });
      expect(undoManager.lastApplicationUndoOrRedo).toEqual("redo");
      expect(undoManager.lastApplicationOldState).toEqual({ counter: 1 });
    });

    it("throws an error if at the end of the stack", () => {
      expect(() => {
        undoManager.redo();
      }).toThrowError("Cannot redo");

      store("counter").set(1);
      expect(() => {
        undoManager.redo();
      }).toThrowError("Cannot redo");

      undoManager.undo();
      undoManager.redo();
      expect(() => {
        undoManager.redo();
      }).toThrowError("Cannot redo");

      store("counter").set(2);
      undoManager.undo();
      undoManager.undo();
      undoManager.redo();
      undoManager.redo();
      expect(() => {
        undoManager.redo();
      }).toThrowError("Cannot redo");
    });
  });

  describe(".dropCurrentUndoState()", () => {
    it("drops the current undo state", () => {
      store("counter").set(1);
      store("counter").set(2);

      expectStack(0, 1, 2);
      undoManager.dropCurrentUndoState();
      expectStack(0, 1);
      undoManager.dropCurrentUndoState();
      expectStack(0);
    });

    it("drops redo history", () => {
      store("counter").set(1);
      store("counter").set(2);
      store("counter").set(3);
      store("counter").set(4);

      undoManager.undo();
      undoManager.undo();
      undoManager.dropCurrentUndoState();
      expectStack(0, 1);
    });

    it("does not affect the store", () => {
      store("counter").set(1);
      store("counter").set(2);

      undoManager.dropCurrentUndoState();
      expect(store.state().counter).toBe(2);

      undoManager.dropCurrentUndoState();
      expect(store.state().counter).toBe(2);
    });

    it("throws an error if at the beginning of the stack", () => {
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError("Nothing to drop");

      store("counter").set(1);
      undoManager.dropCurrentUndoState();
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError("Nothing to drop");

      store("counter").set(2);
      store("counter").set(3);
      undoManager.dropCurrentUndoState();
      undoManager.dropCurrentUndoState();
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError("Nothing to drop");
    });
  });

  describe(".undoStack()", () => {
    // most of `.reset()` is tested by other tests that use `expectStack()`

    it("does not allow callers to mutate the internal stack", () => {
      store("counter").set(1);
      undoManager.undoStack.splice(0, 9999);
      expectStack(0, 1);
    });
  });

  describe(".shouldPush()", () => {
    it("controls whether undo states are actually pushed", () => {
      undoManager.shouldPush = () => true;
      undoManager.pushCurrentState();
      expectStack(0, 0);

      undoManager.shouldPush = () => false;
      undoManager.pushCurrentState();
      expectStack(0, 0);

      undoManager.shouldPush = () => true;
      undoManager.pushCurrentState();
      expectStack(0, 0, 0);

      undoManager.shouldPush = () => false;
      undoManager.pushCurrentState();
      expectStack(0, 0, 0);
    });

    it("is not used if nothing is yet in the stack", () => {
      const spy = jasmine.createSpy().and.returnValue(true);
      undoManager.shouldPush = spy;
      store("counter").set(1);
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      undoManager.reset();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("managing stack size", () => {
    it("respects `maxDepth` by default (when given)", () => {
      undoManager = new TestImpl(store, 2);
      store("counter").set(1);
      expectStack(0, 1);

      store("counter").set(2);
      expectStack(1, 2);

      store("counter").set(3);
      expectStack(2, 3);

      undoManager.undo();
      store("counter").set(4);
      expectStack(2, 4);

      store("counter").set(5);
      expectStack(4, 5);
    });

    it("respects `.isOverSize()` when overridden", () => {
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
      }();

      store("counter").set(1);
      store("counter").set(2);
      store("counter").set(3);
      expectStack(0, 1, 2, 3);

      numToDrop = 2;
      store("counter").set(4);
      expectStack(2, 3, 4);

      numToDrop = 999;
      store("counter").set(5);
      expectStack(5);
    });
  });

  function expectStack(...states: number[]) {
    expect(undoManager.undoStack.map((s) => s.counter)).toEqual(states);
  }
});
