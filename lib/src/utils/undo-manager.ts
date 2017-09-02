import { StoreObject } from '../store-object';

export abstract class UndoManager<StateType, UndoStateType> {
  private stack: UndoStateType[] = [];
  private currentStateIndex: number;

  constructor(
    protected readonly store: StoreObject<StateType>,
    protected maxDepth = 0
  ) {
    this.reset();
  }

  reset() {
    this.currentStateIndex = -1;
    this.pushCurrentState();
  }

  pushCurrentState() {
    ++this.currentStateIndex;
    this.stack[this.currentStateIndex] =
      this.extractUndoState(this.store.state());
    this.stack.splice(this.currentStateIndex + 1, this.stack.length);
    while (this.isOverSize()) { this.stack.pop(); }
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

  protected isOverSize() {
    return this.maxDepth > 0 && this.stack.length > this.maxDepth;
  }

  private applyCurrentState() {
    this.store.batch((batch) => {
      this.applyUndoState(this.stack[this.currentStateIndex], batch);
    });
  }
}
