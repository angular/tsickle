import {hasBoolAndNum} from './clutz2_generated_dee_dot_tee_ess';
import {hasBool} from './clutz_generated_dee_dot_tee_ess';
import {hasString} from './literal_dee_dot_tee_ess';
import {hasNumber} from './tsickle_generated_dee_dot_tee_ess';

export function returnsString(input: string): string {
  return input;
}

export function returnsLiteralDtsImportedType(input: string): hasString {
  return {string: input};
}

export function returnsClutzDtsImportedType(input: string): hasBool {
  return {bool: input.startsWith('some prefix')};
}

export function returnsClutz2DtsImportedType(input: string): hasBoolAndNum {
  return {bool: input.startsWith('some prefix'), num: input.length};
}

export function returnsTsickleDtsImportedType(input: string): hasNumber {
  return {num: input.length};
}