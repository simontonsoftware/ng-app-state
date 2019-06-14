import { get, isFunction } from "micro-dash";
import { Nil } from "s-ng-dev-utils";

export function invoke<T extends object | Nil>(
  object: T,
  path: string[],
  ...args: any[]
) {
  const fn = get(object, path);
  if (isFunction(fn)) {
    return fn.apply(
      path.length === 1 ? object : get(object, path.slice(0, -1)),
      args,
    );
  }
}
