export abstract class ExtensibleFunction {
  constructor(f: Function) {
    return Object.setPrototypeOf(f, new.target.prototype);
  }
}
