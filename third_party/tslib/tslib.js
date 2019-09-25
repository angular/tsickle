/**
 * @fileoverview
 * Hand-modified Closure version of tslib.js.
 * These use the literal space optimized code from TypeScript for
 * compatibility.
 *
 * @suppress {undefinedVars}
 */

/**
 * @license Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
 * WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing permissions
 * and limitations under the License.
 */

goog.module('tslib');

/**
 * @param {?} d
 * @param {?} b
 */
exports.__extends = function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    // LOCAL MODIFICATION: Add jsdoc annotation here:
    /**
     * @constructor
     */
    function __() {
      (/** @type {?} */ (this)).constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

exports.__assign = Object.assign || /** @return {?} */ function (/** ? */ t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

/**
 * @param {?} s
 * @param {?} e
 * @return {?}
 */
exports.__rest = function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && (/** @type {function((string|symbol)):boolean} */ (Object.prototype.propertyIsEnumerable)).call(s, p[i]))
            t[p[i]] = s[p[i]];
    return t;
};

/**
 * @param {?} decorators
 * @param {T} target
 * @param {?=} key
 * @param {?=} desc
 * @return {T}
 * @template T
 */
exports.__decorate = function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    // google3 local modification: use quoted property access to work around
    // https://b.corp.google.com/issues/77140019.
    if (typeof Reflect === "object" && Reflect && typeof Reflect['decorate'] === "function") r = Reflect['decorate'](decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * @param {?} metadataKey
 * @param {?} metadataValue
 * @return {?}
 */
exports.__metadata = function (metadataKey, metadataValue) {
  // google3 local modification: use quoted property access to work around
  // https://b.corp.google.com/issues/77140019.
  if (typeof Reflect === "object" && Reflect && typeof Reflect['metadata'] === "function") return Reflect['metadata'](metadataKey, metadataValue);
};

/**
 * @param {?} paramIndex
 * @param {?} decorator
 * @return {?}
 */
exports.__param = function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); };
};

/**
 * @template T
 * @param {T} thisArg
 * @param {?} _arguments
 * @param {?} P
 * @param {function(this:T)} generator
 * @return {?}
 */
exports.__awaiter = function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        // LOCAL MODIFICATION: Cannot express the function + keys pattern in
        // closure, so we escape generator.next with ? type.
        function fulfilled(value) { try { step((/** @type {?} */ (generator)).next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};

/**
 * @param {?} thisArg
 * @param {?} body
 * @return {?}
 */
exports.__generator = function(thisArg, body) {
  var _ = {
    label: 0,
    sent: function() {
      if (t[0] & 1) throw (/** @type {!Error} */ (t[1]));
      return t[1];
    },
    trys: [],
    ops: []
  },
      f, y, t, g;
  // LOCAL MODIFICATION: Originally iterator body was "return this", but it
  // doesn't compile as this is unknown. Changed to g, which is equivalent.
  return g = {next: verb(0), "throw": verb(1), "return": verb(2)},
         typeof Symbol === "function" && (g[Symbol.iterator] = function() {
           return g;
         }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
        if (f = 1,
            y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) &&
                !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t) op = [0, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return {value: op[1], done: false};
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) &&
                (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5) throw (/** @type {!Error} */ (op[1]));
    return {value: op[0] ? op[1] : void 0, done: true};
  }
};

/**
 * @param {?} m
 * @param {?} e
 */
exports.__exportStar = function (m, e) {
    for (var p in m) if (!e.hasOwnProperty(p)) e[p] = m[p];
};

/**
 * @param {?} o
 * @return {?}
 */
exports.__values = function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};

/**
 * @param {?} o
 * @param {?=} n
 * @return {?}
 */
exports.__read = function(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = {error: error};
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw (/** @type {!Error} */ (e.error));
    }
  }
  return ar;
};

/**
 * @type {function(...?):!Array}
 */
exports.__spread = function() {
  for (var ar = [], i = 0; i < arguments.length; i++)
    ar = ar.concat(exports.__read(arguments[i]));
  return ar;
};

/**
 * @type {function(...!Array):!Array}
 */
exports.__spreadArrays = function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

/**
 * @constructor
 * LOCAL MODIFICATION: Originally used "this" in function body,
 * @this {?}
 * END LOCAL MODIFICATION
 * @param {?} v
 * @return {?}
 */
exports.__await = function(v) {
  return this instanceof exports.__await ? (this.v = v, this) :
                                           new exports.__await(v);
};

/**
 * @param {?} thisArg
 * @param {?=} _arguments
 * @param {?=} generator
 * @return {?}
 */
exports.__asyncGenerator = function __asyncGenerator(
    thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator)
    throw new TypeError('Symbol.asyncIterator is not defined.');
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb('next'), verb('throw'), verb('return'),
         i[Symbol.asyncIterator] = function() {
           return (/** @type {?} */ (this));
         }, i;
  function verb(n) {
    if (g[n])
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof exports.__await ?
        Promise.resolve(/** @type {?} */ (r.value).v).then(fulfill, reject) :
        settle(q[0][2], r);
  }
  function fulfill(value) {
    resume('next', value);
  }
  function reject(value) {
    resume('throw', value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
};

/**
 * @param {?} o
 * @return {?}
 */
exports.__asyncDelegator = function(o) {
  var i, p;
  // LOCAL MODIFICATION: Originally iterator body was "return this", but it
  // doesn't compile in some builds, as this is unknown. Changed to i, which is
  // equivalent.
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return i; }, i;
  /**
   * @param {?} n
   * @param {?=} f
   * @return {?}
   */
  function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
};

/**
 * @param {?} o
 * @return {?}
 */
exports.__asyncValues = function(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator];
  return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
};

/**
 * @param {?=} cooked
 * @param {?=} raw
 * @return {?}
 */
exports.__makeTemplateObject = function(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
