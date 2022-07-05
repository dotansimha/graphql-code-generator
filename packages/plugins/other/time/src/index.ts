import { GraphQLSchema } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import moment from 'moment';
import { extname } from 'path';
import { TimePluginConfig } from './config.js';

export const plugin: PluginFunction<TimePluginConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TimePluginConfig,
  { outputFile }
): Promise<string> => {
  let format: string;
  let message = 'Generated on ';

  if (config && typeof config === 'object') {
    if (config.format) {
      format = config.format;
    }

    if (config.message) {
      message = config.message;
    }
  }

  const outputFileExtension = outputFile && extname(outputFile);
  let commentPrefix = '//';

  if ((outputFileExtension || '').toLowerCase() === '.graphql') {
    commentPrefix = '#';
  }

  return commentPrefix + ' ' + message + moment().format(format) + '\n';
};
