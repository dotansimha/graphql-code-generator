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

export const buildSelectionSetName = (name: string) => `GeneratedSDKSelectionSet${name}`;

const buildFieldSelectionSetString = (field: GraphQLField<any, any>): string => {
  const resultType = getNamedType(field.type);

  let value = `true`;

  if (isObjectType(resultType) || isInterfaceType(resultType) || isUnionType(resultType)) {
    value = buildSelectionSetName(resultType.name);
  }

  if (field.args.length) {
    let requireArguments = false;
    const argumentPartials: Array<string> = [];

    for (const arg of field.args) {
      const isNonNull = isNonNullType(arg.type);
      requireArguments = isNonNull === true || requireArguments;
      argumentPartials.push(`${arg.name}${isNonNull ? `` : `?`}: string | never`);
    }

    const args = stripIndent`
      SDKSelectionSet<{
        [SDKFieldArgumentSymbol]${requireArguments ? `` : `?`}: {
          ${argumentPartials.join(`;\n`)};
        }
      }>
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
    type ${buildSelectionSetName(objectType.name)} = SDKSelectionSet<{
      __typename?: true;
      ${fields.join(`;\n      `)}
    }>;
  `;
};
