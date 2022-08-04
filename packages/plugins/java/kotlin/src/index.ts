import { GraphQLSchema } from 'graphql';
import { PluginFunction, Types, getCachedDocumentNodeFromSchema, oldVisit } from '@graphql-codegen/plugin-helpers';
import { KotlinResolversVisitor } from './visitor.js';
import { buildPackageNameFromPath } from '@graphql-codegen/java-common';
import { dirname, normalize } from 'path';
import { KotlinResolversPluginRawConfig } from './config.js';

export const plugin: PluginFunction<KotlinResolversPluginRawConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: KotlinResolversPluginRawConfig,
  { outputFile }
): Promise<string> => {
  const relevantPath = dirname(normalize(outputFile));
  const defaultPackageName = buildPackageNameFromPath(relevantPath);
  const visitor = new KotlinResolversVisitor(config, schema, defaultPackageName);
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitorResult = oldVisit(astNode, { leave: visitor as any });
  const packageName = visitor.getPackageName();
  const blockContent = visitorResult.definitions.filter(d => typeof d === 'string').join('\n\n');

  return [packageName, blockContent].join('\n');
};
