import { StoreObject } from '../store-object';

export abstract class UndoManager<StateType, UndoStateType> {
  private stack: UndoStateType[] = [];
  private currentStateIndex = -1;

  constructor(private store: StoreObject<StateType>) { }

  pushCurrentState() {
    const state = this.store.state();
    ++this.currentStateIndex;
    this.stack[this.currentStateIndex] = this.extractUndoState(state);
    this.stack.splice(this.currentStateIndex + 1, 9999999);
  }

  canUndo() {
    return this.currentStateIndex > 0;
  }

  canRedo() {
    return this.currentStateIndex < this.stack.length - 1;
  }

  undo() {
    if (!this.canUndo()) { throw new Error('Cannot undo'); }

    --this.currentStateIndex;
    this.applyCurrentState();
  }

  redo() {
    if (!this.canRedo()) { throw new Error('Cannot redo'); }

    ++this.currentStateIndex;
    this.applyCurrentState();
  }

  protected abstract extractUndoState(state: StateType): UndoStateType;

  protected abstract applyUndoState(
    undoState: UndoStateType, batch: StoreObject<StateType>,
  ): void;

  private applyCurrentState() {
    this.store.batch((batch) => {
      this.applyUndoState(this.stack[this.currentStateIndex], batch);
    });
  }
}
