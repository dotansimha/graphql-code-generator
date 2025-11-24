import type { EnumTypeDefinitionNode, EnumValueDefinitionNode, GraphQLEnumType, GraphQLSchema } from 'graphql';
import type { ConvertFn, ParsedEnumValuesMap } from './types';
import { DeclarationBlock, type DeclarationBlockConfig, indent, transformComment, wrapWithSingleQuotes } from './utils';
import { getNodeComment } from './get-node-comment';

interface ConvertSchemaEnumToDeclarationBlockString {
  schema: GraphQLSchema;
  node: EnumTypeDefinitionNode;
  enumName: string;
  enumValues: ParsedEnumValuesMap;
  futureProofEnums: boolean;
  ignoreEnumValuesFromSchema: boolean;
  naming: {
    convert: ConvertFn;
    typesPrefix: string;
    typesSuffix: string;
    useTypesPrefix?: boolean;
    useTypesSuffix?: boolean;
  };

  outputType: 'string-literal' | 'native-numeric' | 'const' | 'native-const' | 'native';
  declarationBlockConfig: DeclarationBlockConfig;
}

export const convertSchemaEnumToDeclarationBlockString = ({
  schema,
  node,
  enumName,
  enumValues,
  futureProofEnums,
  ignoreEnumValuesFromSchema,
  outputType,
  declarationBlockConfig,
  naming,
}: ConvertSchemaEnumToDeclarationBlockString): string => {
  if (enumValues[enumName]?.sourceFile) {
    return `export { ${enumValues[enumName].typeIdentifier} };\n`;
  }

  const getValueFromConfig = (enumValue: string | number) => {
    if (typeof enumValues[enumName]?.mappedValues?.[enumValue] !== 'undefined') {
      return enumValues[enumName].mappedValues[enumValue];
    }
    return null;
  };

  const withFutureAddedValue = [futureProofEnums ? [indent('| ' + wrapWithSingleQuotes('%future added value'))] : []];

  const enumTypeName = convertName({
    options: {
      typesPrefix: naming.typesPrefix,
      typesSuffix: naming.typesSuffix,
      useTypesPrefix: naming.useTypesPrefix,
      useTypesSuffix: naming.useTypesSuffix,
    },
    convert: () => naming.convert(node),
  });

  if (outputType === 'string-literal') {
    return new DeclarationBlock(declarationBlockConfig)
      .export()
      .asKind('type')
      .withComment(node.description?.value)
      .withName(enumTypeName)
      .withContent(
        '\n' +
          node.values
            .map(enumOption => {
              const name = enumOption.name.value;
              const enumValue: string | number = getValueFromConfig(name) ?? name;
              const comment = transformComment(enumOption.description?.value, 1);

              return comment + indent('| ' + wrapWithSingleQuotes(enumValue));
            })
            .concat(...withFutureAddedValue)
            .join('\n')
      ).string;
  }

  if (outputType === 'native-numeric') {
    return new DeclarationBlock(declarationBlockConfig)
      .export()
      .withComment(node.description?.value)
      .withName(enumTypeName)
      .asKind('enum')
      .withBlock(
        node.values
          .map((enumOption, i) => {
            const valueFromConfig = getValueFromConfig(enumOption.name.value);
            const enumValue: string | number = valueFromConfig ?? i;
            const comment = transformComment(enumOption.description?.value, 1);
            const optionName = makeValidEnumIdentifier(
              convertName({
                options: {
                  typesPrefix: naming.typesPrefix,
                  typesSuffix: naming.typesSuffix,
                  useTypesPrefix: false,
                },
                convert: () => naming.convert(enumOption, { transformUnderscore: true }),
              })
            );
            return comment + indent(optionName) + ` = ${enumValue}`;
          })
          .concat(...withFutureAddedValue)
          .join(',\n')
      ).string;
  }

  if (outputType === 'const') {
    const typeName = `export type ${enumTypeName} = typeof ${enumTypeName}[keyof typeof ${enumTypeName}];`;
    const enumAsConst = new DeclarationBlock({
      ...declarationBlockConfig,
      blockTransformer: block => {
        return block + ' as const';
      },
    })
      .export()
      .asKind('const')
      .withName(enumTypeName)
      .withComment(node.description?.value)
      .withBlock(
        node.values
          .map(enumOption => {
            const optionName = makeValidEnumIdentifier(
              convertName({
                options: {
                  typesPrefix: naming.typesPrefix,
                  typesSuffix: naming.typesPrefix,
                },
                convert: () =>
                  naming.convert(enumOption, {
                    transformUnderscore: true,
                  }),
              })
            );
            const comment = transformComment(enumOption.description?.value, 1);
            const name = enumOption.name.value;
            const enumValue: string | number = getValueFromConfig(name) ?? name;

            return comment + indent(`${optionName}: ${wrapWithSingleQuotes(enumValue)}`);
          })
          .join(',\n')
      ).string;

    return [enumAsConst, typeName].join('\n');
  }

  return new DeclarationBlock(declarationBlockConfig)
    .export()
    .asKind(outputType === 'native-const' ? 'const enum' : 'enum')
    .withName(enumTypeName)
    .withComment(node.description?.value)
    .withBlock(
      buildEnumValuesBlock({
        typeName: enumName,
        values: node.values,
        schema,
        naming,
        ignoreEnumValuesFromSchema,
        declarationBlockConfig,
        enumValues,
      })
    ).string;
};

export const buildEnumValuesBlock = ({
  typeName,
  values,
  schema,
  naming,
  ignoreEnumValuesFromSchema,
  declarationBlockConfig,
  enumValues,
}: Pick<
  ConvertSchemaEnumToDeclarationBlockString,
  'schema' | 'naming' | 'ignoreEnumValuesFromSchema' | 'declarationBlockConfig' | 'enumValues'
> & {
  typeName: string;
  values: ReadonlyArray<EnumValueDefinitionNode>;
}): string => {
  const schemaEnumType: GraphQLEnumType | undefined = schema
    ? (schema.getType(typeName) as GraphQLEnumType)
    : undefined;

  return values
    .map(enumOption => {
      const onlyUnderscoresPattern = /^_+$/;
      const optionName = makeValidEnumIdentifier(
        convertName({
          options: {
            useTypesPrefix: false,
            typesPrefix: naming.typesPrefix,
            typesSuffix: naming.typesSuffix,
          },
          convert: () =>
            naming.convert(enumOption, {
              // We can only strip out the underscores if the value contains other
              // characters. Otherwise we'll generate syntactically invalid code.
              transformUnderscore: !onlyUnderscoresPattern.test(enumOption.name.value),
            }),
        })
      );
      const comment = getNodeComment(enumOption);
      const schemaEnumValue =
        schemaEnumType && !ignoreEnumValuesFromSchema
          ? schemaEnumType.getValue(enumOption.name.value).value
          : undefined;
      let enumValue: string | number = typeof schemaEnumValue === 'undefined' ? enumOption.name.value : schemaEnumValue;

      if (typeof enumValues[typeName]?.mappedValues?.[enumValue] !== 'undefined') {
        enumValue = enumValues[typeName].mappedValues[enumValue];
      }

      return (
        comment +
        indent(
          `${optionName}${declarationBlockConfig.enumNameValueSeparator} ${wrapWithSingleQuotes(
            enumValue,
            typeof schemaEnumValue !== 'undefined'
          )}`
        )
      );
    })
    .join(',\n');
};

const makeValidEnumIdentifier = (identifier: string): string => {
  if (/^[0-9]/.exec(identifier)) {
    return wrapWithSingleQuotes(identifier, true);
  }
  return identifier;
};

const convertName = ({
  convert,
  options,
}: {
  options: {
    typesPrefix: string;
    useTypesPrefix?: boolean;
    typesSuffix: string;
    useTypesSuffix?: boolean;
  };
  convert: () => string;
}): string => {
  const useTypesPrefix = typeof options.useTypesPrefix === 'boolean' ? options.useTypesPrefix : true;
  const useTypesSuffix = typeof options.useTypesSuffix === 'boolean' ? options.useTypesSuffix : true;

  let convertedName = '';

  if (useTypesPrefix) {
    convertedName += options.typesPrefix;
  }

  convertedName += convert();

  if (useTypesSuffix) {
    convertedName += options.typesSuffix;
  }

  return convertedName;
};
