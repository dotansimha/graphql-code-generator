import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';

const flow = require('./flow.js');

export function validateFlow(code: Types.PluginOutput) {
  const errors = flow.checkContent('temp.flow.js', mergeOutputs([code]));

  const lint = errors.map(err => {
    const messages = err.message;
    const firstLoc = messages[0].loc;
    const message = messages.map(msg => msg.descr).join('\n');

    return `[l${firstLoc.start.line},c${firstLoc.start.column}][${err.level}]: ${message}`;
  });

  if (lint.length > 0) {
    throw new Error(`Invalid FlowJS Code:\n${lint.join('\n')}`);
  }
}
