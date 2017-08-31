/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalizeLineEndings} from './util';

/**
 * TypeScript has an API for JSDoc already, but it's not exposed.
 * https://github.com/Microsoft/TypeScript/issues/7393
 * For now we create types that are similar to theirs so that migrating
 * to their API will be easier.  See e.g. ts.JSDocTag and ts.JSDocComment.
 */
export interface Tag {
  /**
   * tagName is e.g. "param" in an @param declaration.  It is the empty string
   * for the plain text documentation that occurs before any @foo lines.
   */
  tagName: string;
  /**
   * parameterName is the the name of the function parameter, e.g. "foo"
   * in `\@param foo The foo param`
   */
  parameterName?: string;
  /**
   * The type of a JSDoc \@param, \@type etc tag, rendered in curly braces.
   * Can also hold the type of an \@suppress.
   */
  type?: string;
  /** optional is true for optional function parameters. */
  optional?: boolean;
  /** restParam is true for "...x: foo[]" function parameters. */
  restParam?: boolean;
  /**
   * destructuring is true for destructuring bind parameters, which require
   * non-null arguments on the Closure side.  Can likely remove this
   * once TypeScript nullable types are available.
   */
  destructuring?: boolean;
  /** Any remaining text on the tag, e.g. the description. */
  text?: string;
}

/**
 * A list of all JSDoc tags allowed by the Closure compiler.
 * The public Closure docs don't list all the tags it allows; this list comes
 * from the compiler source itself.
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/Annotation.java
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/ParserConfig.properties
 */
const JSDOC_TAGS_WHITELIST = new Set([
  'abstract',      'argument',
  'author',        'consistentIdGenerator',
  'const',         'constant',
  'constructor',   'copyright',
  'define',        'deprecated',
  'desc',          'dict',
  'disposes',      'enhance',
  'enhanceable',   'enum',
  'export',        'expose',
  'extends',       'externs',
  'fileoverview',  'final',
  'hassoydelcall', 'hassoydeltemplate',
  'hidden',        'id',
  'idGenerator',   'ignore',
  'implements',    'implicitCast',
  'inheritDoc',    'interface',
  'jaggerInject',  'jaggerModule',
  'jaggerProvide', 'jaggerProvidePromise',
  'lends',         'license',
  'link',          'meaning',
  'modifies',      'modName',
  'mods',          'ngInject',
  'noalias',       'nocollapse',
  'nocompile',     'nosideeffects',
  'override',      'owner',
  'package',       'param',
  'pintomodule',   'polymerBehavior',
  'preserve',      'preserveTry',
  'private',       'protected',
  'public',        'record',
  'requirecss',    'requires',
  'return',        'returns',
  'see',           'stableIdGenerator',
  'struct',        'suppress',
  'template',      'this',
  'throws',        'type',
  'typedef',       'unrestricted',
  'version',       'wizaction',
  'wizmodule',
]);

/**
 * A list of JSDoc @tags that are never allowed in TypeScript source. These are Closure tags that
 * can be expressed in the TypeScript surface syntax. As tsickle's emit will mangle type names,
 * these will cause Closure Compiler issues and should not be used.
 */
const JSDOC_TAGS_BLACKLIST = new Set([
  'augments', 'class',      'constructs', 'constructor', 'enum',      'extends', 'field',
  'function', 'implements', 'interface',  'lends',       'namespace', 'private', 'public',
  'record',   'static',     'template',   'this',        'type',      'typedef',
]);

/**
 * A list of JSDoc @tags that might include a {type} after them. Only banned when a type is passed.
 * Note that this does not include tags that carry a non-type system type, e.g. \@suppress.
 */
const JSDOC_TAGS_WITH_TYPES = new Set([
  'const',
  'export',
  'param',
  'return',
]);

/**
 * Result of parsing a JSDoc comment. Such comments essentially are built of a list of tags.
 * In addition to the tags, this might also contain warnings to indicate non-fatal problems
 * while finding the tags.
 */
export interface ParsedJSDocComment {
  tags: Tag[];
  warnings?: string[];
}

/**
 * parse parses JSDoc out of a comment string.
 * Returns null if comment is not JSDoc.
 */
// TODO(martinprobst): representing JSDoc as a list of tags is too simplistic. We need functionality
// such as merging (below), de-duplicating certain tags (@deprecated), and special treatment for
// others (e.g. @suppress). We should introduce a proper model class with a more suitable data
// strucure (e.g. a Map<TagName, Values[]>).
export function parse(comment: string): ParsedJSDocComment|null {
  // Make sure we have proper line endings before parsing on Windows.
  comment = normalizeLineEndings(comment);
  // TODO(evanm): this is a pile of hacky regexes for now, because we
  // would rather use the better TypeScript implementation of JSDoc
  // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
  let match = comment.match(/^\/\*\*([\s\S]*?)\*\/$/);
  if (!match) return null;
  comment = match[1].trim();
  // Strip all the " * " bits from the front of each line.
  comment = comment.replace(/^\s*\*? ?/gm, '');
  const lines = comment.split('\n');
  const tags: Tag[] = [];
  const warnings: string[] = [];
  for (const line of lines) {
    match = line.match(/^@(\S+) *(.*)/);
    if (match) {
      let [_, tagName, text] = match;
      if (tagName === 'returns') {
        // A synonym for 'return'.
        tagName = 'return';
      }
      let type: string|undefined;
      if (JSDOC_TAGS_BLACKLIST.has(tagName)) {
        warnings.push(`@${tagName} annotations are redundant with TypeScript equivalents`);
        continue;  // Drop the tag so Closure won't process it.
      } else if (JSDOC_TAGS_WITH_TYPES.has(tagName) && text[0] === '{') {
        warnings.push(
            `the type annotation on @${tagName} is redundant with its TypeScript type, ` +
            `remove the {...} part`);
        continue;
      } else if (tagName === 'suppress') {
        const suppressMatch = text.match(/^\{(.*)\}(.*)$/);
        if (!suppressMatch) {
          warnings.push(`malformed @suppress tag: "${text}"`);
        } else {
          [, type, text] = suppressMatch;
        }
      } else if (tagName === 'dict') {
        warnings.push('use index signatures (`[k: string]: type`) instead of @dict');
        continue;
      }

      // Grab the parameter name from @param tags.
      let parameterName: string|undefined;
      if (tagName === 'param') {
        match = text.match(/^(\S+) ?(.*)/);
        if (match) [_, parameterName, text] = match;
      }

      const tag: Tag = {tagName};
      if (parameterName) tag.parameterName = parameterName;
      if (text) tag.text = text;
      if (type) tag.type = type;
      tags.push(tag);
    } else {
      // Text without a preceding @tag on it is either the plain text
      // documentation or a continuation of a previous tag.
      if (tags.length === 0) {
        tags.push({tagName: '', text: line});
      } else {
        const lastTag = tags[tags.length - 1];
        lastTag.text = (lastTag.text || '') + '\n' + line;
      }
    }
  }
  if (warnings.length > 0) {
    return {tags, warnings};
  }
  return {tags};
}

/**
 * Serializes a Tag into a string usable in a comment.
 * Returns a string like " @foo {bar} baz" (note the whitespace).
 */
function tagToString(tag: Tag, escapeExtraTags = new Set<string>()): string {
  let out = '';
  if (tag.tagName) {
    if (!JSDOC_TAGS_WHITELIST.has(tag.tagName) || escapeExtraTags.has(tag.tagName)) {
      // Escape tags we don't understand.  This is a subtle
      // compromise between multiple issues.
      // 1) If we pass through these non-Closure tags, the user will
      //    get a warning from Closure, and the point of tsickle is
      //    to insulate the user from Closure.
      // 2) The output of tsickle is for Closure but also may be read
      //    by humans, for example non-TypeScript users of Angular.
      // 3) Finally, we don't want to warn because users should be
      //    free to add whichever JSDoc they feel like.  If the user
      //    wants help ensuring they didn't typo a tag, that is the
      //    responsibility of a linter.
      out += ` \\@${tag.tagName}`;
    } else {
      out += ` @${tag.tagName}`;
    }
  }
  if (tag.type) {
    out += ' {';
    if (tag.restParam) {
      out += '...';
    }
    out += tag.type;
    if (tag.optional) {
      out += '=';
    }
    out += '}';
  }
  if (tag.parameterName) {
    out += ' ' + tag.parameterName;
  }
  if (tag.text) {
    out += ' ' + tag.text.replace(/@/g, '\\@');
  }
  return out;
}

/** Tags that must only occur onces in a comment (filtered below). */
const SINGLETON_TAGS = new Set(['deprecated']);

/** Serializes a Comment out to a string usable in source code. */
export function toString(tags: Tag[], escapeExtraTags = new Set<string>()): string {
  if (tags.length === 0) return '';
  if (tags.length === 1) {
    const tag = tags[0];
    if ((tag.tagName === 'type' || tag.tagName === 'nocollapse') &&
        (!tag.text || !tag.text.match('\n'))) {
      // Special-case one-liner "type" and "nocollapse" tags to fit on one line, e.g.
      //   /** @type {foo} */
      return '/**' + tagToString(tag, escapeExtraTags) + ' */\n';
    }
    // Otherwise, fall through to the multi-line output.
  }

  let out = '';
  out += '/**\n';
  const emitted = new Set<string>();
  for (const tag of tags) {
    if (emitted.has(tag.tagName) && SINGLETON_TAGS.has(tag.tagName)) {
      continue;
    }
    emitted.add(tag.tagName);
    out += ' *';
    // If the tagToString is multi-line, insert " * " prefixes on subsequent lines.
    out += tagToString(tag, escapeExtraTags).split('\n').join('\n * ');
    out += '\n';
  }
  out += ' */\n';
  return out;
}

/** Merges multiple tags (of the same tagName type) into a single unified tag. */
export function merge(tags: Tag[]): Tag {
  const tagNames = new Set<string>();
  const parameterNames = new Set<string>();
  const types = new Set<string>();
  const texts = new Set<string>();
  // If any of the tags are optional/rest, then the merged output is optional/rest.
  let optional = false;
  let restParam = false;
  for (const tag of tags) {
    if (tag.tagName) tagNames.add(tag.tagName);
    if (tag.parameterName) parameterNames.add(tag.parameterName);
    if (tag.type) types.add(tag.type);
    if (tag.text) texts.add(tag.text);
    if (tag.optional) optional = true;
    if (tag.restParam) restParam = true;
  }

  if (tagNames.size !== 1) {
    throw new Error(`cannot merge differing tags: ${JSON.stringify(tags)}`);
  }
  const tagName = tagNames.values().next().value;
  const parameterName =
      parameterNames.size > 0 ? Array.from(parameterNames).join('_or_') : undefined;
  const type = types.size > 0 ? Array.from(types).join('|') : undefined;
  const text = texts.size > 0 ? Array.from(texts).join(' / ') : undefined;
  const tag: Tag = {tagName, parameterName, type, text};
  if (optional) tag.optional = true;
  if (restParam) tag.restParam = true;
  return tag;
}
