/**
 * TypeScript has an API for JSDoc already, but it's not exposed.
 * https://github.com/Microsoft/TypeScript/issues/7393
 * For now we create types that are similar to theirs so that migrating
 * to their API will be easier.  See e.g. ts.JSDocTag and ts.JSDocComment.
 */
export interface Tag {
  // tagName is e.g. "param" in an @param declaration.  It's absent
  // for the plain text documentation that occurs before any @foo lines.
  tagName?: string;
  // parameterName is the the name of the function parameter, e.g. "foo"
  // in
  //   @param foo The foo param.
  parameterName?: string;
  type?: string;
  // optional is true for optional function parameters.
  optional?: boolean;
  // restParam is true for "...x: foo[]" function parameters.
  restParam?: boolean;
  // destructuring is true for destructuring bind parameters, which require
  // non-null arguments on the Closure side.  Can likely remove this
  // once TypeScript nullable types are available.
  destructuring?: boolean;
  text?: string;
}

/** Matches ts.JSDocComment. */
export interface Comment { tags: Tag[]; }

function arrayIncludes<T>(array: T[], key: T): boolean {
  for (const elem of array) {
    if (elem === key) return true;
  }
  return false;
}

/**
 * A list of JSDoc @tags that are never allowed in TypeScript source.
 * These are Closure tags that can be expressed in the TypeScript surface
 * syntax.  Note that we don't disallow all Closure-specific tags here,
 * because a user might want to specify them for some optimization purpose;
 * if they affect Closure, the compiler will yell at them and hopefuly it
 * will be obvious.
 */
const JSDOC_TAGS_BLACKLIST = ['private', 'public', 'type'];

/** A list of JSDoc @tags that might include a {type} after them. */
const JSDOC_TAGS_WITH_TYPES = ['export', 'param', 'return'];

/**
 * parse parses JSDoc out of a comment string.
 * Returns null if comment is not JSDoc.
 */
export function parse(comment: string): Comment {
  // TODO(evanm): this is a pile of hacky regexes for now, because we
  // would rather use the better TypeScript implementation of JSDoc
  // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
  let match = comment.match(/^\/\*\*([\s\S]*?)\*\/$/);
  if (!match) return null;
  comment = match[1].trim();
  // Strip all the " * " bits from the front of each line.
  comment = comment.replace(/^\s*\* /gm, '');
  let lines = comment.split('\n');
  let tags: Tag[] = [];
  for (let line of lines) {
    match = line.match(/^@(\S+) *(.*)/);
    if (match) {
      let [_, tagName, text] = match;
      if (tagName === 'returns') {
        // A synonym for 'return'.
        tagName = 'return';
      }
      if (arrayIncludes(JSDOC_TAGS_BLACKLIST, tagName)) {
        throw new Error(`@${tagName} annotations are not allowed`);
      }
      if (arrayIncludes(JSDOC_TAGS_WITH_TYPES, tagName) && text[0] === '{') {
        throw new Error('type annotations (using {...}) are not allowed');
      }

      // Grab the parameter name from @param tags.
      let parameterName: string;
      if (tagName === 'param') {
        match = text.match(/^(\S+) ?(.*)/);
        if (match) [_, parameterName, text] = match;
      }

      let tag: Tag = {tagName};
      if (parameterName) tag.parameterName = parameterName;
      if (text) tag.text = text;
      tags.push(tag);
    } else {
      // Text without a preceding @tag on it is either the plain text
      // documentation or a continuation of a previous tag.
      if (tags.length === 0) {
        tags.push({text: line.trim()});
      } else {
        tags[tags.length - 1].text += ' ' + line.trim();
      }
    }
  }
  return {tags};
}

/** Serializes a Comment out to a string usable in source code. */
export function toString(jsdoc: Comment): string {
  let out = '';
  out += '/**\n';
  for (let tag of jsdoc.tags) {
    out += ' * ';
    if (tag.tagName) {
      out += `@${tag.tagName}`;
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
      out += ' ' + tag.text;
    }
    out += '\n';
  }
  out += ' */\n';
  return out;
}
