import { GraphQLSchema, GraphQLEnumType } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { EnumArrayPluginConfig } from './config';

function getEnumTypeMap(schema: GraphQLSchema): GraphQLEnumType[] {
  const typeMap = schema.getTypeMap();
  const result: GraphQLEnumType[] = [];
  for (const key in typeMap) {
    if (typeMap[key].astNode?.kind === 'EnumTypeDefinition') {
      result.push(typeMap[key] as GraphQLEnumType);
    }
  }
  return result;
}

function buildArrayDefinition(e: GraphQLEnumType): string {
  const upperName = e.name
    .replace(/[A-Z]/g, letter => `_${letter}`)
    .slice(1)
    .toUpperCase();
  const values = e
    .getValues()
    .map(v => `'${v.value}'`)
    .join(', ');
  return `export const ${upperName}: ${e.name}[] = [${values}];`;
}

function buildImportStatement(enums: GraphQLEnumType[], importFrom: string): string[] {
  const names: string[] = Object.values(enums).map(e => e.name);
  return [`import { ${names.join(', ')} } from "${importFrom}";`];
}

export const plugin: PluginFunction<EnumArrayPluginConfig> = async (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: EnumArrayPluginConfig
): Promise<Types.PluginOutput> => {
  const importFrom: EnumArrayPluginConfig['importFrom'] = config.importFrom;
  const enums = getEnumTypeMap(schema);
  const content = enums.map(buildArrayDefinition).join('\n');

  const result: Types.PluginOutput = { content };
  if (importFrom) {
    result['prepend'] = buildImportStatement(enums, importFrom);
  }
  return result;
};

export default { plugin };
