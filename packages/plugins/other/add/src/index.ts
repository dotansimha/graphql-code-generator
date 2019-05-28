import { GraphQLSchema } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';

type ContentType = string | string[] | { [index: string]: string };
interface AddPluginParams {
  placement: string;
  content: ContentType;
}
export type AddPluginConfig = string | AddPluginParams;

const asFileString = (content: ContentType) => {
  const asArray = Array.isArray(content) ? content : typeof content === 'object' ? Object.keys(content).map(k => content[k]) : [content];
  return asArray.filter(a => typeof a === 'string');
};

export const plugin: PluginFunction<AddPluginConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: AddPluginConfig): Promise<Types.PluginOutput> => {
  // Will always be object if specified as array or object
  if (typeof config !== 'object') { return { content: null, prepend: asFileString(config) }; }

  let placement = config.placement;
  let content = config.content;

  if (placement && placement !== 'prepend' && placement !== 'content' && placement !== 'append') {
    throw Error('Add plugin, faulty placement option');
  }
  if (!placement) { placement = 'prepend'; }

  if (!content) { throw Error('Add plugin, missing content'); }

  return {
    content: null,
    [placement]: asFileString(content),
  };
};
