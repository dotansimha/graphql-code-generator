import { GraphQLBoolean, GraphQLObjectType, GraphQLUnionType } from 'graphql';
import { buildUnionSelectionString } from './buildUnionSelectionString';

describe('buildUnionSelectionString', () => {
  it('correct selection set for single union member', () => {
    const union = new GraphQLUnionType({
      name: 'Foo',
      types: [new GraphQLObjectType({ name: 'Hee', fields: { a: { type: GraphQLBoolean } } })],
    });
    expect(buildUnionSelectionString(union)).toMatchInlineSnapshot(`
      "type GeneratedSDKSelectionSetFoo = SDKSelectionSet<{
        \\"...Hee\\": GeneratedSDKSelectionSetHee;
      }>;"
    `);
  });
  it('correct selection set for multi union member', () => {
    const union = new GraphQLUnionType({
      name: 'Foo',
      types: [
        new GraphQLObjectType({ name: 'Hee', fields: { a: { type: GraphQLBoolean } } }),
        new GraphQLObjectType({ name: 'Hoo', fields: { a: { type: GraphQLBoolean } } }),
      ],
    });
    expect(buildUnionSelectionString(union)).toMatchInlineSnapshot(`
      "type GeneratedSDKSelectionSetFoo = SDKSelectionSet<{
        \\"...Hee\\": GeneratedSDKSelectionSetHee;
        \\"...Hoo\\": GeneratedSDKSelectionSetHoo;
      }>;"
    `);
  });
});
