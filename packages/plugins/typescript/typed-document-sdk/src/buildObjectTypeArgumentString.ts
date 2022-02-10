import { stripIndent } from 'common-tags';
import { GraphQLObjectType, GraphQLField, getNamedType, isScalarType, isEnumType } from 'graphql';

export const buildObjectArgumentsName = (name: string) => `GeneratedSDKArguments${name}`;

const buildFieldArgumentsString = (field: GraphQLField<any, any>): string => {
  const resultType = getNamedType(field.type);

  let fieldPartial =
    isScalarType(resultType) || isEnumType(resultType) ? '{}' : buildObjectArgumentsName(resultType.name);

  if (field.args.length) {
    const argumentPartials: Array<string> = [];

    for (const arg of field.args) {
      argumentPartials.push(`${arg.name}: "${arg.type.toString()}"`);
    }

    fieldPartial =
      fieldPartial +
      ' & ' +
      stripIndent`
      {
        [SDKFieldArgumentSymbol]: {
          ${argumentPartials.join(`;\n         `)};
        }
      }
    `
        .split(`\n`)
        .map((line, i) => (i === 0 ? line : `      ${line}`))
        .join(`\n`);
  }

  return `${field.name}: ${fieldPartial};`;
};

export const buildObjectTypeArgumentString = (objectType: GraphQLObjectType) => {
  const fields: Array<string> = [];
  for (const field of Object.values(objectType.getFields())) {
    fields.push(buildFieldArgumentsString(field));
  }
  return stripIndent`
    type ${buildObjectArgumentsName(objectType.name)} = {
      ${fields.join(`\n      `)}
    };
  `;
};
