import { GraphQLDirective, GraphQLSchema } from 'graphql';
import { getDirectiveValues } from 'graphql/execution/values';
import { DirectiveUseMap } from '../types';

export function getDirectives(schema: GraphQLSchema, node: any): DirectiveUseMap {
  const schemaDirectives: GraphQLDirective[] = schema.getDirectives ? schema.getDirectives() : [];
  const astNode = node['astNode'];
  let result: DirectiveUseMap = {};

  if (astNode) {
    schemaDirectives.forEach((directive: GraphQLDirective) => {
      const directiveValue = getDirectiveValues(directive, astNode);

      if (directiveValue !== undefined) {
        result[directive.name] = directiveValue || {};
      }
    });
  }

  return result;
}
