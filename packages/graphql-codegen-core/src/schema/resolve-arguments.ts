import { GraphQLArgument } from 'graphql';
import { Argument } from '../types';
import { resolveType } from './resolve-type';

export function resolveArguments(args: GraphQLArgument[]): Argument[] {
  return args.map((arg: GraphQLArgument): Argument => {
    const type = resolveType(arg.type);

    return {
      name: arg.name,
      description: arg.description || '',
      type: type.name,
      isRequired: type.isRequired,
      isArray: type.isArray,
    };
  });
}
