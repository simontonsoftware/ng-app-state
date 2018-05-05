import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { StoreObject } from '../store-object';

export type UndoOrRedo = 'undo' | 'redo';

export abstract class UndoManager<StateType, UndoStateType> {
  private stack: UndoStateType[] = [];
  private currentStateIndex: number;

  private canUndoSubject = new ReplaySubject<boolean>(1);
  private canRedoSubject = new ReplaySubject<boolean>(1);
  private stateSubject = new ReplaySubject<UndoStateType>(1);

  /**
   * An observable that emits the result of `canUndo()` every time that value changes.
   */
  canUndo$: Observable<boolean> = this.canUndoSubject.pipe(
    distinctUntilChanged(),
  );

  /**
   * An observable that emits the result of `canRedo()` every time that value changes.
   */
  canRedo$: Observable<boolean> = this.canRedoSubject.pipe(
    distinctUntilChanged(),
  );

  /**
   * An observable that emits the current state every time it changes.
   */
  state$: Observable<UndoStateType> = this.stateSubject.pipe(
    distinctUntilChanged(),
  );

  /**
   * @param maxDepth The maximum size of the history before discarding the oldest state. `0` means no limit.
   */
  constructor(
    protected readonly store: StoreObject<StateType>,
    protected maxDepth = 0,
  ) {
    this.reset();
  }

  /**
   * Discard all history and push the current state.
   */
  reset() {
    this.currentStateIndex = -1;
    this.pushCurrentState();
  }

  /**
   * Add the current state to the undo history. Any states that could be reached
   * using `redo()` are discarded.
   */
  pushCurrentState() {
    ++this.currentStateIndex;
    this.stack[this.currentStateIndex] = this.extractUndoState(
      this.store.state(),
    );
    this.stack.splice(this.currentStateIndex + 1, this.stack.length);

    while (this.stack.length > 1 && this.isOverSize(this.stack.length)) {
      this.stack.shift();
      --this.currentStateIndex;
    }

    this.fireUndoChanges();
  }

  /**
   * @returns whether any states are available for `undo()`
   */
  canUndo() {
    return this.currentStateIndex > 0;
  }

  /**
   * @returns whether any states are available for `redo()`
   */
  canRedo() {
    return this.currentStateIndex < this.stack.length - 1;
  }

  /**
   * Move backward one step in the history of states saved via `pushCurrentState()`, setting the store to contain that state again.
   *
   * @throws Error when there is no such state (i.e. when `canUndo()` returns false)
   */
  undo() {
    if (!this.canUndo()) {
      throw new Error('Cannot undo');
    }

    this.changeState(-1, 'undo');
  }

  /**
   * Move forward one step in the history of states saved via `pushCurrentState()`, setting the store to contain that state again.
   *
   * @throws Error when there is no such state (i.e. when `canRedo()` returns false)
   */
  redo() {
    if (!this.canRedo()) {
      throw new Error('Cannot redo');
    }

    this.changeState(1, 'redo');
  }

  /**
   * Return the information needed to reconstruct the given state. This will be passed to `applyUndoState()` when the store should be reset to this state.
   */
  protected abstract extractUndoState(state: StateType): UndoStateType;

  /**
   * Reset the store to the given state.
   *
   * The `undoOrRedo` and `oldState` parameters can be useful e.g. if a scroll position is kept in the undo state. In such a case you want to change the scrolling so the user can see what just changed by undoing/redoing. To do that, set the scoll to what it was in `oldState` when undoing, and to what it is in `newState` when redoing.
   */
  protected abstract applyUndoState(
    newState: UndoStateType,
    batch: StoreObject<StateType>,
    undoOrRedo: UndoOrRedo,
    oldState: UndoStateType,
  ): void;

  /**
   * Each time a state is added to the history, this method will be called to determine whether the oldest state should be dropped. Override to implement more complex logic than the simple `maxDepth`.
   */
  protected isOverSize(size: number) {
    return this.maxDepth > 0 && size > this.maxDepth;
  }

  private changeState(change: 1 | -1, undoOrRedo: UndoOrRedo) {
    const oldState = this.stack[this.currentStateIndex];
    this.currentStateIndex += change;
    const newState = this.stack[this.currentStateIndex];
    this.store.batch((batch) => {
      this.applyUndoState(newState, batch, undoOrRedo, oldState);
    });
    this.fireUndoChanges();
  }

  private fireUndoChanges() {
    this.canUndoSubject.next(this.canUndo());
    this.canRedoSubject.next(this.canRedo());
    this.stateSubject.next(this.stack[this.currentStateIndex]);
  }
}
