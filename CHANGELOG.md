# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="7.0.0"></a>
# [7.0.0](https://github.com/simontonsoftware/ng-app-state/compare/v6.2.0...v7.0.0) (2018-06-01)


* Update to Angular 6 (#8) ([61fc7d2](https://github.com/simontonsoftware/ng-app-state/commit/61fc7d2)), closes [#8](https://github.com/simontonsoftware/ng-app-state/issues/8)


### BREAKING CHANGES

* Because of changes to underlying libraries, trying to modify state whose ancestor is `undefined` or `null` no longer throws an error. The error is now only printed to the console.
* requires `@angular >=6.0.0 <7.0.0`
* requires `@ngrx >=6.0.0 <7.0.0`
* requires `micro-dash@^3.5.0`



<a name="6.2.0"></a>
# [6.2.0](https://github.com/simontonsoftware/ng-app-state/compare/v6.1.1...v6.2.0) (2018-04-28)


### Features

* performance improvement when there are many subscriptions at different levels of the store ([3d88476](https://github.com/simontonsoftware/ng-app-state/commit/3d88476))



<a name="6.1.1"></a>
## [6.1.1](https://github.com/simontonsoftware/ng-app-state/compare/v6.1.0...v6.1.1) (2018-04-27)


### Bug Fixes

* **nasModel:** certain controls threw an error on blur ([4435274](https://github.com/simontonsoftware/ng-app-state/commit/4435274))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/simontonsoftware/ng-app-state/compare/v6.0.0...v6.1.0) (2018-04-22)


### Features

* **nasModel:** warn about inefficient template bindings ([4d32654](https://github.com/simontonsoftware/ng-app-state/commit/4d32654))
* **StoreObject:** add `.refersToSameStateAs()` ([5e535b8](https://github.com/simontonsoftware/ng-app-state/commit/5e535b8))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/simontonsoftware/ng-app-state/compare/v5.1.0...v6.0.0) (2018-04-22)


### Features

* **AppStore:** add `.action$` ([28923fe](https://github.com/simontonsoftware/ng-app-state/commit/28923fe))


### BREAKING CHANGES

* **AppStore:** `.dispatch()` moved from `StoreObject` to `AppState`



<a name="5.1.0"></a>
# [5.1.0](https://github.com/simontonsoftware/ng-app-state/compare/v5.0.0...v5.1.0) (2018-04-17)


### Features

* **StoreObject:** add `.inBatch()` ([4beab91](https://github.com/simontonsoftware/ng-app-state/commit/4beab91))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/simontonsoftware/ng-app-state/compare/v4.3.0...v5.0.0) (2018-04-14)


* Add [nasModel] to bind form controls directly to store objects ([8849965](https://github.com/simontonsoftware/ng-app-state/commit/8849965)), closes [#6](https://github.com/simontonsoftware/ng-app-state/issues/6)


### BREAKING CHANGES

* requires `micro-dash` 3.3.0, up from `3.0.0`.



<a name="4.3.0"></a>
# [4.3.0](https://github.com/simontonsoftware/ng-app-state/compare/v4.2.0...v4.3.0) (2018-04-11)


### Features

* **UndoManager:** pass more info to `.applyUndoState()` ([d5e4aa5](https://github.com/simontonsoftware/ng-app-state/commit/d5e4aa5))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/simontonsoftware/ng-app-state/compare/v4.1.1...v4.2.0) (2018-02-02)


### Features

* **StoreObject:** add `.withCaching()` and `.caches()` ([55b46da](https://github.com/simontonsoftware/ng-app-state/commit/55b46da))



<a name="4.1.1"></a>
## [4.1.1](https://github.com/simontonsoftware/ng-app-state/compare/v4.1.0...v4.1.1) (2018-02-01)


### Bug Fixes

* update peer dependency declarations ([aad3b2d](https://github.com/simontonsoftware/ng-app-state/commit/aad3b2d))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/simontonsoftware/ng-app-state/compare/v4.0.0...v4.1.0) (2018-02-01)


### Features

* **UndoManager:** `.state$` observable ([6a42fc7](https://github.com/simontonsoftware/ng-app-state/commit/6a42fc7))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/simontonsoftware/ng-app-state/compare/v3.1.1...v4.0.0) (2017-11-27)


### Features

* Added `StoreObject.mutateUsing` ([f3fee7f](https://github.com/simontonsoftware/ng-app-state/commit/f3fee7f))
* Added `StoreObject.setUsing` ([8d8e5ce](https://github.com/simontonsoftware/ng-app-state/commit/8d8e5ce))


### BREAKING CHANGES

* Removed `StoreObject.merge(value)`. Instead use `StoreObject.mutateUsing(merge, value)`, where `merge` comes from [lodash](https://github.com/lodash/lodash) or [micro-dash](https://github.com/simontonsoftware/micro-dash) (the previous implementation was using `micro-dash` under the hood). ([313f628](https://github.com/simontonsoftware/ng-app-state/commit/313f628))



<a name="3.1.1"></a>
## [3.1.1](https://github.com/simontonsoftware/ng-app-state/compare/v3.1.0...v3.1.1) (2017-11-19)


### Bug Fixes

* NPM was installing the wrong version by default.



<a name="3.1.0"></a>
# [3.1.0](https://github.com/simontonsoftware/ng-app-state/compare/v3.0.1...v3.1.0) (2017-11-18)


### Features

* **UndoManager:** `.canUndo$` and `.canRedo$` observables ([a049b5c](https://github.com/simontonsoftware/ng-app-state/commit/a049b5c))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/simontonsoftware/ng-app-state/compare/v3.0.0...v3.0.1) (2017-11-18)


### Bug Fixes

* **UndoManager:** don't test for `isOverSize` when nothing to drop ([e094279](https://github.com/simontonsoftware/ng-app-state/commit/e094279))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/simontonsoftware/ng-app-state/compare/v2.0.0...v3.0.0) (2017-11-03)


### Features

* Support Angular 5 ([6629273](https://github.com/simontonsoftware/ng-app-state/commit/6629273))


### BREAKING CHANGES

* requires rxjs >= 5.5 and angular >= 5.0



<a name="2.0.0"></a>
# [2.0.0](https://github.com/simontonsoftware/ng-app-state/compare/v1.0.2...v2.0.0) (2017-10-05)


### Features

* allow `delete()` called directly on a store ([01849d1](https://github.com/simontonsoftware/ng-app-state/commit/01849d1))


### BREAKING CHANGES

* `StoreModule` must now be given `ngAppStateReducer` in its list of meta reducers



<a name="1.0.2"></a>
## [1.0.2](https://github.com/simontonsoftware/ng-app-state/compare/v1.0.1...v1.0.2) (2017-10-03)


### Bug Fixes

* possible bugfix when using multiples stores ([173088b](https://github.com/simontonsoftware/ng-app-state/commit/173088b))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/simontonsoftware/ng-app-state/compare/v1.0.0...v1.0.1) (2017-10-03)


### Bug Fixes

* possible bugfix when using multiples stores ([002205e](https://github.com/simontonsoftware/ng-app-state/commit/002205e))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/simontonsoftware/ng-app-state/compare/v0.4.3...v1.0.0) (2017-09-09)



<a name="0.4.3"></a>
## [0.4.3](https://github.com/simontonsoftware/ng-app-state/compare/v0.4.2...v0.4.3) (2017-09-02)


### Bug Fixes

* **UndoManager:** trim from bottom of stack ([1d12c4a](https://github.com/simontonsoftware/ng-app-state/commit/1d12c4a))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/simontonsoftware/ng-app-state/compare/v0.4.1...v0.4.2) (2017-09-02)


### Bug Fixes

* **UndoManager:** trimming stack when over size caused an error ([f396ca2](https://github.com/simontonsoftware/ng-app-state/commit/f396ca2))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/simontonsoftware/ng-app-state/compare/v0.4.0...v0.4.1) (2017-09-02)


### Bug Fixes

* **UndoManager:** allow subclasses to access `store` and `maxDepth` ([4aed3b4](https://github.com/simontonsoftware/ng-app-state/commit/4aed3b4))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/simontonsoftware/ng-app-state/compare/v0.3.0...v0.4.0) (2017-09-02)


### Features

* `UndoManager` supports max depth, or custom sizing ([427cdd7](https://github.com/simontonsoftware/ng-app-state/commit/427cdd7))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/simontonsoftware/ng-app-state/compare/v0.2.1...v0.3.0) (2017-09-02)


### Features

* `UndoManager.reset()` ([1ae53e9](https://github.com/simontonsoftware/ng-app-state/commit/1ae53e9))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/simontonsoftware/ng-app-state/compare/v0.2.0...v0.2.1) (2017-09-01)


### Bug Fixes

* Export `UndoManager` ([7a12889](https://github.com/simontonsoftware/ng-app-state/commit/7a12889))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/simontonsoftware/ng-app-state/compare/v0.1.0...v0.2.0) (2017-09-01)


### Features

* Added `UndoManager` ([bc8ff79](https://github.com/simontonsoftware/ng-app-state/commit/bc8ff79))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/simontonsoftware/ng-app-state/compare/v0.0.6...v0.1.0) (2017-08-13)


### Features

* Added `StoreObject.assign()` ([4f1a20f](https://github.com/simontonsoftware/ng-app-state/commit/4f1a20f))



<a name="0.0.6"></a>
## [0.0.6](https://github.com/simontonsoftware/ng-app-state/compare/v0.0.5...v0.0.6) (2017-08-07)


### Bug Fixes

* merge does not mutate ([e47b7cf](https://github.com/simontonsoftware/ng-app-state/commit/e47b7cf))



<a name="0.0.5"></a>
## [0.0.5](https://github.com/simontonsoftware/ng-app-state/compare/v0.0.4...v0.0.5) (2017-08-07)


### Bug Fixes

* merge does a deep merge ([d976843](https://github.com/simontonsoftware/ng-app-state/commit/d976843))



<a name="0.0.4"></a>
## [0.0.4](https://github.com/simontonsoftware/ng-app-state/compare/v0.0.3...v0.0.4) (2017-08-06)


### Bug Fixes

* `Observable` is external ([413e39e](https://github.com/simontonsoftware/ng-app-state/commit/413e39e))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/simontonsoftware/ng-app-state/compare/v0.0.2...v0.0.3) (2017-08-06)


### Bug Fixes

* Error in `store.state()` ([91f087b](https://github.com/simontonsoftware/ng-app-state/commit/91f087b))



<a name="0.0.2"></a>
## [0.0.2](https://github.com/simontonsoftware/ng-app-state/compare/v0.0.1...v0.0.2) (2017-08-06)


### Bug Fixes

* observing the root store ([47ddd97](https://github.com/simontonsoftware/ng-app-state/commit/47ddd97))



<a name="0.0.1"></a>
## 0.0.1 (2017-08-05)
