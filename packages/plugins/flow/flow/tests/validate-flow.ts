const flow = require('./flow.js');

export function validateFlow(code: string) {
  const errors = flow.checkContent('temp.flow.js', code);

  var lint = errors.map(function(err) {
    var messages = err.message;
    var firstLoc = messages[0].loc;
    var message = messages
      .map(function(msg) {
        return msg.descr;
      })
      .join('\n');

    return `[l${firstLoc.start.line},c${firstLoc.start.column}][${err.level}]: ${message}`;
  });

  if (lint.length > 0) {
    throw new Error(`Invalid FlowJS Code:\n${lint.join('\n')}`);
  }
}
