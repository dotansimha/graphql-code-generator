import * as babylon from 'babylon';

/*!
 * strip-comments <https://github.com/jonschlinkert/strip-comments>
 *
 * Copyright (c) 2014-2016, 2018, Jon Schlinkert.
 * Released under the MIT License.
 *
 * Strip all code comments from the given `input`, including protected
 * comments that start with `!`, unless disabled by setting `options.keepProtected`
 * to true.
 *
 * ```js
 * const str = strip('const foo = "bar";// this is a comment\n /* me too *\/');
 * console.log(str);
 * // => 'const foo = "bar";'
 * ```
 * @name  strip
 * @param  {String} `input` string from which to strip comments
 * @param  {Object} `options` optional options, passed to [extract-comments][extract-comments]
 * @option {Boolean} [options] `line` if `false` strip only block comments, default `true`
 * @option {Boolean} [options] `block` if `false` strip only line comments, default `true`
 * @option {Boolean} [options] `keepProtected` Keep ignored comments (e.g. `/*!` and `//!`)
 * @option {Boolean} [options] `preserveNewlines` Preserve newlines after comments are stripped
 * @return {String} modified input
 * @api public
 */

/**
 * Strip comments
 */

function stripComments(
  input: string,
  options?: {
    sourceType?: babylon.BabylonOptions['sourceType'];
  }
) {
  if (typeof input !== 'string') {
    throw new TypeError('expected a string');
  }

  const defaults = {
    // we shouldn't care about this here since our goal is to strip comments,
    // not transpiling, and this has been a common cause of parsing issues
    allowReturnOutsideFunction: true,
    // casting because @types/babylon hasn't updated to babylon@^7
    plugins: ['typescript', 'jsx'] as any[]
  };

  const opts = { ...defaults, ...options };

  const res = babylon.parse(input, opts);
  const comments = res.comments;
  let pos = { start: 0, end: 0, removed: 0 };
  if (!comments) {
    return input;
  }

  for (const comment of comments) {
    input = remove(input, comment, pos);
  }

  return input;
}

/**
 * Remove a single comment from the given string.
 */

function remove(str, comment, pos) {
  let nl = '';

  if (comment.type === 'CommentLine') {
    const before = str.slice(0, comment.start - pos.removed);
    const after = str.slice(comment.end - pos.removed);
    pos.removed += comment.end - comment.start - nl.length;
    return before + nl + after;
  }

  if (comment.type === 'CommentBlock') {
    const before = str.slice(0, comment.start - pos.removed);
    const after = str.slice(comment.end - pos.removed);
    pos.removed += comment.end - comment.start - nl.length;
    return before + nl + after;
  }

  return str;
}

export default stripComments;
