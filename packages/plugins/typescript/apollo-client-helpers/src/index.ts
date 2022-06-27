import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, isInterfaceType, isObjectType } from 'graphql';
import { extname } from 'path';
import { ApolloClientHelpersConfig } from './config.js';

export const plugin: PluginFunction<ApolloClientHelpersConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: ApolloClientHelpersConfig
) => {
  const results: Types.ComplexPluginOutput[] = [];

  results.push(generateTypePoliciesSignature(schema, config));

  return {
    prepend: results.reduce((prev, r) => [...prev, ...(r.prepend || [])], []),
    append: results.reduce((prev, r) => [...prev, ...(r.append || [])], []),
    content: results.map(r => r.content).join('\n'),
  };
};

function generateTypePoliciesSignature(
  schema: GraphQLSchema,
  config: ApolloClientHelpersConfig
): Types.ComplexPluginOutput {
  const typeMap = schema.getTypeMap();
  const perTypePolicies: string[] = [];
  const typedTypePolicies = Object.keys(typeMap).reduce((prev, typeName) => {
    const type = typeMap[typeName];

    if (!typeName.startsWith('__') && (isObjectType(type) || isInterfaceType(type))) {
      const fieldsNames = Object.keys(type.getFields()).filter(f => !f.startsWith('__'));
      const keySpecifierVarName = `${typeName}KeySpecifier`;
      const fieldPolicyVarName = `${typeName}FieldPolicy`;

      perTypePolicies.push(
        `export type ${keySpecifierVarName} = (${fieldsNames
          .map(f => `'${f}'`)
          .join(' | ')} | ${keySpecifierVarName})[];`
      );

      perTypePolicies.push(`export type ${fieldPolicyVarName} = {
${fieldsNames.map(fieldName => `\t${fieldName}?: FieldPolicy<any> | FieldReadFunction<any>`).join(',\n')}
};`);

      return {
        ...prev,
        [typeName]: `Omit<TypePolicy, "fields" | "keyFields"> & {
\t\tkeyFields${
          config.requireKeyFields ? '' : '?'
        }: false | ${keySpecifierVarName} | (() => undefined | ${keySpecifierVarName}),
\t\tfields?: ${fieldPolicyVarName},
\t}`,
      };
    }

    return prev;
  }, {} as Record<string, string>);

  const rootTypes = [
    schema.getQueryType()?.name,
    schema.getMutationType()?.name,
    schema.getSubscriptionType()?.name,
  ].filter(Boolean);

  const rootContent = `export type StrictTypedTypePolicies = {${Object.keys(typedTypePolicies)
    .map(typeName => {
      const nonOptional = config.requirePoliciesForAllTypes && !rootTypes.includes(typeName);

      return `\n\t${typeName}${nonOptional ? '' : '?'}: ${typedTypePolicies[typeName]}`;
    })
    .join(',')}\n};\nexport type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;`;

  return {
    prepend: [
      `import ${
        config.useTypeImports ? 'type ' : ''
      }{ FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';`,
    ],
    content: [...perTypePolicies, rootContent].join('\n'),
  };
}

export const validate: PluginValidateFn<ApolloClientHelpersConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
    throw new Error(`Plugin "apollo-client-helpers" requires extension to be ".ts" or ".tsx"!`);
  }
};
