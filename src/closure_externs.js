/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Extern definitions for types missing in the Closure externs,
 * but used in TypeScript platform `.d.ts`.
 * @externs
 */

/** @typedef {!IArrayLike} */
var ArrayLike;

/** @typedef {!HTMLCollection} */
var HTMLCollectionOf;

/** @typedef {!HTMLTableCellElement} */
var HTMLTableDataCellElement;

/**
 * Does not have an equivalent in Closure's externs.
 * @typedef {!HTMLTableCellElement}
 */
var HTMLTableHeaderCellElement;

/**
 * Closure's NodeList is parameterized itself, there is no NodeListOf.
 * @constructor
 * @template T
 * @extends {NodeList<T>}
 */
var NodeListOf;

/**
 * Closure models this as a plain Array.
 * @typedef {!IArrayLike<string>|null}
 */
var RegExpExecArray;

/**
 * @record
 * @template T
 * @extends {IArrayLike<T>}
 */
function ReadonlyArray() {}

/**
 * @constructor
 * @template K, V
 * @extends {Map<K, V>}
 */
function ReadonlyMap() {}

/**
 * @constructor
 * @template T
 * @extends {Set<T>}
 */
function ReadonlySet() {}

/**
 * @record
 * @template T
 * @extends {IThenable<T>}
 */
function PromiseLike() {};

/** @typedef {function(new:Promise)} */
var PromiseConstructor;

/** @typedef {function(new:Promise, function(function(*=), function(*=)))} */
var PromiseConstructorLike;

/** @typedef {?} */
var SymbolConstructor;

/**
 * @constructor
 * @param {(undefined|!AnimationEffectReadOnly)=} effect
 * @param {(undefined|!AnimationTimeline)=} timeline
 */
var Animation = function(effect, timeline) {}
/** @type {(null|number)} */
Animation.prototype.currentTime;
/** @type {!AnimationEffectReadOnly} */
Animation.prototype.effect;
/** @type {!Promise<!Animation>} */
Animation.prototype.finished;
/** @type {string} */
Animation.prototype.id;
/** @type {boolean} */
Animation.prototype.pending;
/** @type {string} */
Animation.prototype.playState;
/** @type {number} */
Animation.prototype.playbackRate;
/** @type {!Promise<!Animation>} */
Animation.prototype.ready;
/** @type {number} */
Animation.prototype.startTime;
/** @type {!AnimationTimeline} */
Animation.prototype.timeline;
/** @type {function(this: (!Animation), !AnimationPlaybackEvent): ?} */
Animation.prototype.oncancel;
/** @type {function(this: (!Animation), !AnimationPlaybackEvent): ?} */
Animation.prototype.onfinish;

/**
 * @return {void}
 */
Animation.prototype.cancel = function() {};

/**
 * @return {void}
 */
Animation.prototype.finish = function() {};

/**
 * @return {void}
 */
Animation.prototype.pause = function() {};

/**
 * @return {void}
 */
Animation.prototype.play = function() {};

/**
 * @return {void}
 */
Animation.prototype.reverse = function() {};

/**
 * @record
 * @struct
 */
function AnimationEffectReadOnly() {}
/** @type {number} */
AnimationEffectReadOnly.prototype.timing;

/**
 * @return {!ComputedTimingProperties}
 */
AnimationEffectReadOnly.prototype.getComputedTiming = function() {};
/**
 * @extends {EventInit}
 * @record
 * @struct
 */
function AnimationEventInit() {}
/** @type {(undefined|number)} */
AnimationEventInit.prototype.animationName;
/** @type {(undefined|number)} */
AnimationEventInit.prototype.elapsedTime;
/**
 * @constructor
 * @param {string} typeArg
 * @param {(undefined|!AnimationEventInit)=} eventInitDict
 */
var AnimationEvent = function(typeArg, eventInitDict) {}
/** @type {string} */
AnimationEvent.prototype.animationName;
/** @type {number} */
AnimationEvent.prototype.elapsedTime;

/**
 * @record
 * @struct
 */
function AnimationKeyFrame() {}
/** @type {(undefined|string|!Array<string>)} */
AnimationKeyFrame.prototype.easing;
/** @type {(undefined|null|number|!Array<(null|number)>)} */
AnimationKeyFrame.prototype.offset;

/**
 * @record
 * @struct
 */
function AnimationOptions() {}
/** @type {(undefined|number)} */
AnimationOptions.prototype.delay;
/** @type {(undefined|string)} */
AnimationOptions.prototype.direction;
/** @type {(undefined|number)} */
AnimationOptions.prototype.duration;
/** @type {(undefined|string)} */
AnimationOptions.prototype.easing;
/** @type {(undefined|number)} */
AnimationOptions.prototype.endDelay;
/** @type {(undefined|string)} */
AnimationOptions.prototype.fill;
/** @type {(undefined|string)} */
AnimationOptions.prototype.id;
/** @type {(undefined|number)} */
AnimationOptions.prototype.iterationStart;
/** @type {(undefined|number)} */
AnimationOptions.prototype.iterations;
/**
 * @constructor
 * @param {string} type
 * @param {(undefined|!AnimationPlaybackEventInit)=} eventInitDict
 */
var AnimationPlaybackEvent = function(type, eventInitDict) {}
/** @type {(null|number)} */
AnimationPlaybackEvent.prototype.currentTime;
/** @type {(null|number)} */
AnimationPlaybackEvent.prototype.timelineTime;

/**
 * @extends {EventInit}
 * @record
 * @struct
 */
function AnimationPlaybackEventInit() {}
/** @type {(undefined|null|number)} */
AnimationPlaybackEventInit.prototype.currentTime;
/** @type {(undefined|null|number)} */
AnimationPlaybackEventInit.prototype.timelineTime;
/**
 * @record
 * @struct
 */
function AnimationTimeline() {}
/** @type {(null|number)} */
AnimationTimeline.prototype.currentTime;
/**
 * @record
 * @struct
 */
function ComputedTimingProperties() {}
/** @type {number} */
ComputedTimingProperties.prototype.activeDuration;
/** @type {(null|number)} */
ComputedTimingProperties.prototype.currentIteration;
/** @type {number} */
ComputedTimingProperties.prototype.endTime;
/** @type {(null|number)} */
ComputedTimingProperties.prototype.localTime;
/** @type {(null|number)} */
ComputedTimingProperties.prototype.progress;
