/**
 * @fileoverview Tests that complex union/tuple types for rest parameters get emitted as a fallback
 * '?' unknown type.
 */

export function fn(...args: [number]|[string, number]) {}
