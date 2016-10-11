<a name="0.2.0"></a>
## [0.2.0](https://github.com/angular/angular/compare/0.1.7...0.2.0) (2016-10-06)


### Bug Fixes

* Don't emit `arguments` (Fixes [#219](https://github.com/angular/tsickle/issues/219))
* Use `hasOwnProperty` for method overloading (Fixes [#216](https://github.com/angular/tsickle/issues/216))
* Replace illegal characters when converting to goog.module ([#207](https://github.com/angular/tsickle/pull/207))
* Avoid string literals in enums (Fixes [#205](https://github.com/angular/tsickle/issues/205))
* Pin TypeScript version (Fixes [#200](https://github.com/angular/tsickle/issues/200))

### Features

* Expose a module.id API ([#236](https://github.com/angular/tsickle/pull/236))
* [Source maps](https://github.com/angular/tsickle/commit/d1d2895b2346cb7aca3396051ec68cb033f8296c)
* Emit externs for all interfaces ([#213](https://github.com/angular/tsickle/pull/213))
* Emit typedefs ([#201](https://github.com/angular/tsickle/pulls/208))
* Annotate getters/setters ([#201](https://github.com/angular/tsickle/issues/201))
* Emit @abstract in JSDoc ([D245](https://reviews.angular.io/D245))

### BREAKING CHANGES

* The `process()` API [now takes](https://github.com/angular/tsickle/pull/236/files) a moduleID parameter
