import { stripIndent } from 'common-tags';
import {
  getNamedType,
  GraphQLField,
  GraphQLObjectType,
  isInterfaceType,
  isNonNullType,
  isObjectType,
  isUnionType,
} from 'graphql';

export const buildObjectSelectionSetName = (name: string) => `GeneratedSDKSelectionSet${name}`;

const buildFieldSelectionSetString = (field: GraphQLField<any, any>): string => {
  const resultType = getNamedType(field.type);

  let value = `true`;

  if (isInterfaceType(resultType) || isUnionType(resultType)) {
    throw new Error('Not yet supported. Interfaces and Union.');
  }

  if (isObjectType(resultType)) {
    value = buildObjectSelectionSetName(resultType.name);
  }

  if (field.args.length) {
    let requireArguments = false;
    const argumentPartials: Array<string> = [];

    for (const arg of field.args) {
      const isNonNull = isNonNullType(arg.type);
      requireArguments = isNonNull === true || requireArguments;
      argumentPartials.push(`${arg.name}${isNonNull ? `` : `?`}: true`);
    }

    const args = stripIndent`
      {
        [SDKFieldArgumentSymbol]${requireArguments ? `` : `?`}: {
          ${argumentPartials.join(`;\n`)};
        }
      }
    `
      .split(`\n`)
      .map((line, i) => (i === 0 ? line : `      ${line}`))
      .join(`\n`);

    if (value === `true`) {
      if (requireArguments) {
        value = args;
      } else {
        value = `${value} | ${args}`;
      }
    } else {
      value = `${value} & ${args}`;
    }
  }

  return `${field.name}?: ${value};`;
};

export const buildObjectTypeSelectionString = (objectType: GraphQLObjectType): string => {
  const fields: Array<string> = [];
  for (const field of Object.values(objectType.getFields())) {
    fields.push(buildFieldSelectionSetString(field));
  }

  return stripIndent`
    type ${buildObjectSelectionSetName(objectType.name)} = SDKSelectionSet<{
      __typename?: true;
      ${fields.join(`;\n      `)}
    }>;
  `;
};
