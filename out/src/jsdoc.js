"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGeneratedFromComment = exports.merge = exports.toString = exports.toStringWithoutStartEnd = exports.toSynthesizedComment = exports.suppressLeadingCommentsRecursively = exports.getLeadingCommentRangesSynthesized = exports.synthesizeLeadingComments = exports.parseContents = exports.normalizeLineEndings = exports.parse = exports.TAGS_CONFLICTING_WITH_TYPE = void 0;
const ts = require("typescript");
/**
 * A list of all JSDoc tags allowed by the Closure compiler.
 * All tags other than these are escaped before emitting.
 *
 * Note that some of these tags are also rejected by tsickle when seen in
 * the user-provided source, but also that tsickle itself may generate some of these.
 * This list is just used for controlling the output.
 *
 * The public Closure docs don't list all the tags it allows; this list comes
 * from the compiler source itself.
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/Annotation.java
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/ParserConfig.properties
 */
const CLOSURE_ALLOWED_JSDOC_TAGS_OUTPUT = new Set([
    'abstract',
    'alternateMessageId',
    'author',
    'const',
    'constant',
    'constructor',
    'copyright',
    'define',
    'deprecated',
    'desc',
    'dict',
    'disposes',
    'enhance',
    'enhanceable',
    'enum',
    'export',
    'expose',
    'extends',
    'externs',
    'fileoverview',
    'final',
    'hassoydelcall',
    'hassoydeltemplate',
    'hidden',
    'id',
    'idGenerator',
    'ignore',
    'implements',
    'implicitCast',
    'inheritDoc',
    'interface',
    'jaggerInject',
    'jaggerModule',
    'jaggerProvide',
    'jaggerProvidePromise',
    'lends',
    'license',
    'link',
    'meaning',
    'modifies',
    'modName',
    'mods',
    'ngInject',
    'noalias',
    'nocollapse',
    'nocompile',
    'noinline',
    'nosideeffects',
    'override',
    'owner',
    'package',
    'param',
    'pintomodule',
    'polymer',
    'polymerBehavior',
    'preserve',
    'preserveTry',
    'private',
    'protected',
    'public',
    'record',
    'requirecss',
    'requires',
    'return',
    'returns',
    'see',
    'struct',
    'suppress',
    'template',
    'this',
    'throws',
    'type',
    'typedef',
    'unrestricted',
    'version',
    'wizaction',
    'wizcallback',
    'wizmodule',
]);
/**
 * A list of JSDoc @tags that are never allowed in TypeScript source. These are Closure tags that
 * can be expressed in the TypeScript surface syntax. As tsickle's emit will mangle type names,
 * these will cause Closure Compiler issues and should not be used.
 * Note: 'template' is special-cased below; see where this set is queried.
 */
const BANNED_JSDOC_TAGS_INPUT = new Set([
    'augments', 'class', 'constructs', 'constructor', 'enum', 'extends', 'field',
    'function', 'implements', 'interface', 'lends', 'namespace', 'private', 'protected',
    'public', 'record', 'static', 'template', 'this', 'type', 'typedef',
]);
/**
 * Tags that conflict with \@type in Closure Compiler and must always be
 * escaped (e.g. \@param).
 */
exports.TAGS_CONFLICTING_WITH_TYPE = new Set(['param', 'return']);
/**
 * JSDoc \@tags that might include a {type} after them. Specifying a type is forbidden, since it
 * would collide with TypeScript's type information. If a type *is* given, the entire tag will be
 * ignored.
 */
const JSDOC_TAGS_WITH_TYPES = new Set([
    'const',
    'define',
    'export',
    ...exports.TAGS_CONFLICTING_WITH_TYPE
]);
/**
 * Tags that, if they are the only tag, should be printed in a single line JSDoc
 * comment.
 */
const ONE_LINER_TAGS = new Set(['type', 'typedef', 'nocollapse', 'const']);
/**
 * parse parses JSDoc out of a comment string.
 * Returns null if comment is not JSDoc.
 */
// TODO(martinprobst): representing JSDoc as a list of tags is too simplistic. We need functionality
// such as merging (below), de-duplicating certain tags (@deprecated), and special treatment for
// others (e.g. @suppress). We should introduce a proper model class with a more suitable data
// strucure (e.g. a Map<TagName, Values[]>).
function parse(comment) {
    // TODO(evanm): this is a pile of hacky regexes for now, because we
    // would rather use the better TypeScript implementation of JSDoc
    // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
    if (comment.kind !== ts.SyntaxKind.MultiLineCommentTrivia)
        return null;
    // comment.text does not include /* and */, so must start with '*' for JSDoc.
    if (comment.text[0] !== '*')
        return null;
    const text = comment.text.substring(1).trim();
    return parseContents(text);
}
exports.parse = parse;
/**
 * Returns the input string with line endings normalized to '\n'.
 */
function normalizeLineEndings(input) {
    return input.replace(/\r\n/g, '\n');
}
exports.normalizeLineEndings = normalizeLineEndings;
/**
 * parseContents parses JSDoc out of a comment text.
 * Returns null if comment is not JSDoc.
 *
 * @param commentText a comment's text content, i.e. the comment w/o /* and * /.
 */
function parseContents(commentText) {
    // Make sure we have proper line endings before parsing on Windows.
    commentText = normalizeLineEndings(commentText);
    // Strip all the " * " bits from the front of each line.
    commentText = commentText.replace(/^\s*\*? ?/gm, '');
    const lines = commentText.split('\n');
    const tags = [];
    const warnings = [];
    for (const line of lines) {
        let match = line.match(/^\s*@(\S+) *(.*)/);
        if (match) {
            let [_, tagName, text] = match;
            if (tagName === 'returns') {
                // A synonym for 'return'.
                tagName = 'return';
            }
            let type;
            if (BANNED_JSDOC_TAGS_INPUT.has(tagName)) {
                if (tagName !== 'template') {
                    // Tell the user to not write banned tags, because there is TS
                    // syntax available for them.
                    warnings.push(`@${tagName} annotations are redundant with TypeScript equivalents`);
                    continue; // Drop the tag so Closure won't process it.
                }
                else {
                    // But @template in particular is special: it's ok for the user to
                    // write it for documentation purposes, but we don't want the
                    // user-written one making it into the output because Closure interprets
                    // it as well.
                    // Drop it without any warning.  (We also don't ensure its correctness.)
                    continue;
                }
            }
            else if (JSDOC_TAGS_WITH_TYPES.has(tagName)) {
                if (text[0] === '{') {
                    warnings.push(`the type annotation on @${tagName} is redundant with its TypeScript type, ` +
                        `remove the {...} part`);
                    continue;
                }
            }
            else if (tagName === 'suppress') {
                const typeMatch = text.match(/^\{(.*)\}(.*)$/);
                if (typeMatch) {
                    [, type, text] = typeMatch;
                }
                else {
                    warnings.push(`malformed @${tagName} tag: "${text}"`);
                }
            }
            else if (tagName === 'dict') {
                warnings.push('use index signatures (`[k: string]: type`) instead of @dict');
                continue;
            }
            // Grab the parameter name from @param tags.
            let parameterName;
            if (tagName === 'param') {
                match = text.match(/^(\S+) ?(.*)/);
                if (match)
                    [_, parameterName, text] = match;
            }
            const tag = { tagName };
            if (parameterName)
                tag.parameterName = parameterName;
            if (text)
                tag.text = text;
            if (type)
                tag.type = type;
            tags.push(tag);
        }
        else {
            // Text without a preceding @tag on it is either the plain text
            // documentation or a continuation of a previous tag.
            if (tags.length === 0) {
                tags.push({ tagName: '', text: line });
            }
            else {
                const lastTag = tags[tags.length - 1];
                lastTag.text = (lastTag.text || '') + '\n' + line;
            }
        }
    }
    if (warnings.length > 0) {
        return { tags, warnings };
    }
    return { tags };
}
exports.parseContents = parseContents;
/**
 * Serializes a Tag into a string usable in a comment.
 * Returns a string like " @foo {bar} baz" (note the whitespace).
 */
function tagToString(tag, escapeExtraTags = new Set()) {
    let out = '';
    if (tag.tagName) {
        if (!CLOSURE_ALLOWED_JSDOC_TAGS_OUTPUT.has(tag.tagName) || escapeExtraTags.has(tag.tagName)) {
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
        }
        else {
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
/**
 * synthesizeLeadingComments parses the leading comments of node, converts them
 * to synthetic comments, and makes sure the original text comments do not get
 * emitted by TypeScript.
 */
function synthesizeLeadingComments(node) {
    const existing = ts.getSyntheticLeadingComments(node);
    if (existing)
        return existing;
    const text = node.getFullText();
    const synthComments = getLeadingCommentRangesSynthesized(text, node.getFullStart());
    if (synthComments.length) {
        ts.setSyntheticLeadingComments(node, synthComments);
        suppressLeadingCommentsRecursively(node);
    }
    return synthComments;
}
exports.synthesizeLeadingComments = synthesizeLeadingComments;
/**
 * parseLeadingCommentRangesSynthesized parses the leading comment ranges out of the given text and
 * converts them to SynthesizedComments.
 * @param offset the offset of text in the source file, e.g. node.getFullStart().
 */
// VisibleForTesting
function getLeadingCommentRangesSynthesized(text, offset = 0) {
    const comments = ts.getLeadingCommentRanges(text, 0) || [];
    return comments.map((cr) => {
        // Confusingly, CommentRange in TypeScript includes start and end markers, but
        // SynthesizedComments do not.
        const commentText = cr.kind === ts.SyntaxKind.SingleLineCommentTrivia ?
            text.substring(cr.pos + 2, cr.end) :
            text.substring(cr.pos + 2, cr.end - 2);
        return Object.assign(Object.assign({}, cr), { text: commentText, pos: -1, end: -1, originalRange: { pos: cr.pos + offset, end: cr.end + offset } });
    });
}
exports.getLeadingCommentRangesSynthesized = getLeadingCommentRangesSynthesized;
/**
 * suppressCommentsRecursively prevents emit of leading comments on node, and any recursive nodes
 * underneath it that start at the same offset.
 */
function suppressLeadingCommentsRecursively(node) {
    // TypeScript emits leading comments on a node, unless:
    // - the comment was emitted by the parent node
    // - the node has the NoLeadingComments emit flag.
    // However, transformation steps sometimes copy nodes without keeping their emit flags, so just
    // setting NoLeadingComments recursively is not enough, we must also set the text range to avoid
    // the copied node to have comments emitted.
    const originalStart = node.getFullStart();
    function suppressCommentsInternal(node) {
        ts.setEmitFlags(node, ts.EmitFlags.NoLeadingComments);
        return !!ts.forEachChild(node, (child) => {
            if (child.pos !== originalStart)
                return true;
            return suppressCommentsInternal(child);
        });
    }
    suppressCommentsInternal(node);
}
exports.suppressLeadingCommentsRecursively = suppressLeadingCommentsRecursively;
function toSynthesizedComment(tags, escapeExtraTags, hasTrailingNewLine = true) {
    return {
        kind: ts.SyntaxKind.MultiLineCommentTrivia,
        text: toStringWithoutStartEnd(tags, escapeExtraTags),
        pos: -1,
        end: -1,
        hasTrailingNewLine,
    };
}
exports.toSynthesizedComment = toSynthesizedComment;
/** Serializes a Comment out to a string, but does not include the start and end comment tokens. */
function toStringWithoutStartEnd(tags, escapeExtraTags = new Set()) {
    return serialize(tags, false, escapeExtraTags);
}
exports.toStringWithoutStartEnd = toStringWithoutStartEnd;
/** Serializes a Comment out to a string usable in source code. */
function toString(tags, escapeExtraTags = new Set()) {
    return serialize(tags, true, escapeExtraTags);
}
exports.toString = toString;
function serialize(tags, includeStartEnd, escapeExtraTags = new Set()) {
    if (tags.length === 0)
        return '';
    if (tags.length === 1) {
        const tag = tags[0];
        if (ONE_LINER_TAGS.has(tag.tagName) &&
            (!tag.text || !tag.text.match('\n'))) {
            // Special-case one-liner "type" and "nocollapse" tags to fit on one line, e.g.
            //   /** @type {foo} */
            const text = tagToString(tag, escapeExtraTags);
            return includeStartEnd ? `/**${text} */` : `*${text} `;
        }
        // Otherwise, fall through to the multi-line output.
    }
    let out = includeStartEnd ? '/**\n' : '*\n';
    const emitted = new Set();
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
    out += includeStartEnd ? ' */\n' : ' ';
    return out;
}
/** Merges multiple tags (of the same tagName type) into a single unified tag. */
function merge(tags) {
    const tagNames = new Set();
    const parameterNames = new Set();
    const types = new Set();
    const texts = new Set();
    // If any of the tags are optional/rest, then the merged output is optional/rest.
    let optional = false;
    let restParam = false;
    for (const tag of tags) {
        tagNames.add(tag.tagName);
        if (tag.parameterName !== undefined)
            parameterNames.add(tag.parameterName);
        if (tag.type !== undefined)
            types.add(tag.type);
        if (tag.text !== undefined)
            texts.add(tag.text);
        if (tag.optional)
            optional = true;
        if (tag.restParam)
            restParam = true;
    }
    if (tagNames.size !== 1) {
        throw new Error(`cannot merge differing tags: ${JSON.stringify(tags)}`);
    }
    const tagName = tagNames.values().next().value;
    const parameterName = parameterNames.size > 0 ? Array.from(parameterNames).join('_or_') : undefined;
    const type = types.size > 0 ? Array.from(types).join('|') : undefined;
    // @template uses text (not type!) to declare its type parameters, with ','-separated text.
    const isTemplateTag = tagName === 'template';
    const text = texts.size > 0 ? Array.from(texts).join(isTemplateTag ? ',' : ' / ') : undefined;
    const tag = { tagName, parameterName, type, text };
    // Note: a param can either be optional or a rest param; if we merged an
    // optional and rest param together, prefer marking it as a rest param.
    if (restParam) {
        tag.restParam = true;
    }
    else if (optional) {
        tag.optional = true;
    }
    return tag;
}
exports.merge = merge;
/**
 * Creates comment to be added in generated code to help map generated code
 * back to the original .ts or .d.ts file. It is used by other tools like
 * Kythe to produce cross-language references so it's exact text shouldn't
 * change without updating corresponding tools.
 */
function createGeneratedFromComment(file) {
    return `Generated from: ${file}`;
}
exports.createGeneratedFromComment = createGeneratedFromComment;
//# sourceMappingURL=jsdoc.js.map