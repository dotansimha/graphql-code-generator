import * as babylon from 'babylon';
import { CommentBlock, CommentLine, Comment } from 'babel-types';

/*!
 * strip-comments <https://github.com/jonschlinkert/strip-comments>
 *
 * Copyright (c) 2014-2016, 2018, Jon Schlinkert.
 * Released under the MIT License.
 *
 */

const removeComment = (
  str: string,
  comment: CommentBlock | CommentLine | Comment,
  pos: { start: number; end: number; removed: number }
) => {
  let nl = '';

  // the casting is safe because if type does not exist
  // we will be comparing undefined against a string
  if ((comment as CommentLine).type === 'CommentLine') {
    const before = str.slice(0, comment.start - pos.removed);
    const after = str.slice(comment.end - pos.removed);
    pos.removed += comment.end - comment.start - nl.length;
    return before + nl + after;
  }

  if ((comment as CommentBlock).type === 'CommentBlock') {
    const before = str.slice(0, comment.start - pos.removed);
    const after = str.slice(comment.end - pos.removed);
    pos.removed += comment.end - comment.start - nl.length;
    return before + nl + after;
  }

  return str;
};

const stripComments = (
  input: string,
  options?: {
    sourceType?: babylon.BabylonOptions['sourceType'];
  }
) => {
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
    input = removeComment(input, comment, pos);
  }

  return input;
};

export default stripComments;
