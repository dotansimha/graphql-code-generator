import { GraphQLBoolean, GraphQLObjectType, GraphQLUnionType } from 'graphql';
import { buildUnionArgumentString } from './buildUnionArgumentString';

describe('buildUnionArgumentString', () => {
  it('single union member', () => {
    const unionType = new GraphQLUnionType({
      name: 'Foo',
      types: [new GraphQLObjectType({ name: 'Hee', fields: { a: { type: GraphQLBoolean } } })],
    });
    expect(buildUnionArgumentString(unionType)).toMatchInlineSnapshot(`
      "type GeneratedSDKArgumentsFoo = {
        \\"...Hee\\": GeneratedSDKArgumentsHee;
      };"
    `);
  });
  it('multiple union member', () => {
    const unionType = new GraphQLUnionType({
      name: 'Foo',
      types: [
        new GraphQLObjectType({ name: 'Hee', fields: { a: { type: GraphQLBoolean } } }),
        new GraphQLObjectType({ name: 'Hoo', fields: { a: { type: GraphQLBoolean } } }),
      ],
    });
    expect(buildUnionArgumentString(unionType)).toMatchInlineSnapshot(`
      "type GeneratedSDKArgumentsFoo = {
        \\"...Hee\\": GeneratedSDKArgumentsHee;
        \\"...Hoo\\": GeneratedSDKArgumentsHoo;
      };"
    `);
  });
});
