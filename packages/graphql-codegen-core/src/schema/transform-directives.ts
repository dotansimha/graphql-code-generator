import { GraphQLDirective, DirectiveLocation, GraphQLSchema } from 'graphql';
import { Directive } from '../types';
import { resolveArguments } from './resolve-arguments';

export function transformDirectives(schema: GraphQLSchema, directives: GraphQLDirective[]): Directive[] {
  return directives.map<Directive>((directive: GraphQLDirective): Directive => {
    const args = resolveArguments(schema, directive.args);
    const locations = directive.locations || [];

    return {
      name: directive.name,
      description: directive.description || '',
      hasArguments: args.length > 0,
      arguments: args,
      locations,

      onFragmentSpread: locations.includes(DirectiveLocation.FRAGMENT_SPREAD),
      onInlineFragment: locations.includes(DirectiveLocation.INLINE_FRAGMENT),
      onQuery: locations.includes(DirectiveLocation.QUERY),
      onMutation: locations.includes(DirectiveLocation.MUTATION),
      onSubscription: locations.includes(DirectiveLocation.SUBSCRIPTION),
      onFragment: locations.includes(DirectiveLocation.FRAGMENT_SPREAD),
      onField: locations.includes(DirectiveLocation.FIELD),

      onSchema: locations.includes(DirectiveLocation.SCHEMA),
      onScalar: locations.includes(DirectiveLocation.SCALAR),
      onFieldDefinition: locations.includes(DirectiveLocation.FIELD_DEFINITION),
      onEnum: locations.includes(DirectiveLocation.ENUM),
      onEnumValue: locations.includes(DirectiveLocation.ENUM_VALUE),
      onObject: locations.includes(DirectiveLocation.OBJECT),
      onInputObject: locations.includes(DirectiveLocation.INPUT_OBJECT),
      onInputField: locations.includes(DirectiveLocation.INPUT_FIELD_DEFINITION),
      onArgument: locations.includes(DirectiveLocation.ARGUMENT_DEFINITION),
      onInterface: locations.includes(DirectiveLocation.INTERFACE),
      onUnion: locations.includes(DirectiveLocation.UNION)
    };
  });
}
