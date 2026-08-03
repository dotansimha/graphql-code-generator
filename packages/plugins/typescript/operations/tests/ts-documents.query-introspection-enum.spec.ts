import { buildSchema, parse, versionInfo } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

if (versionInfo.major <= 16) {
  describe('TypeScript Operations Plugin - Query introspection enums graphql <= v16', () => {
    it('should handle introspection types (__schema)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Info {
          __schema {
            directives {
              locations
            }
          }
        }
      `);

      const result = mergeOutputs([
        await plugin(testSchema, [{ document: query }], {}, { outputFile: '' }),
      ]);

      expect(result).toMatchInlineSnapshot(`
          "/** Internal type. DO NOT USE DIRECTLY. */
          type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
          /** Internal type. DO NOT USE DIRECTLY. */
          export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
          /** A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies. */
          export type __DirectiveLocation =
            /** Location adjacent to a query operation. */
            | 'QUERY'
            /** Location adjacent to a mutation operation. */
            | 'MUTATION'
            /** Location adjacent to a subscription operation. */
            | 'SUBSCRIPTION'
            /** Location adjacent to a field. */
            | 'FIELD'
            /** Location adjacent to a fragment definition. */
            | 'FRAGMENT_DEFINITION'
            /** Location adjacent to a fragment spread. */
            | 'FRAGMENT_SPREAD'
            /** Location adjacent to an inline fragment. */
            | 'INLINE_FRAGMENT'
            /** Location adjacent to a variable definition. */
            | 'VARIABLE_DEFINITION'
            /** Location adjacent to a schema definition. */
            | 'SCHEMA'
            /** Location adjacent to a scalar definition. */
            | 'SCALAR'
            /** Location adjacent to an object type definition. */
            | 'OBJECT'
            /** Location adjacent to a field definition. */
            | 'FIELD_DEFINITION'
            /** Location adjacent to an argument definition. */
            | 'ARGUMENT_DEFINITION'
            /** Location adjacent to an interface definition. */
            | 'INTERFACE'
            /** Location adjacent to a union definition. */
            | 'UNION'
            /** Location adjacent to an enum definition. */
            | 'ENUM'
            /** Location adjacent to an enum value definition. */
            | 'ENUM_VALUE'
            /** Location adjacent to an input object type definition. */
            | 'INPUT_OBJECT'
            /** Location adjacent to an input object field definition. */
            | 'INPUT_FIELD_DEFINITION'
            /** Location adjacent to a directive definition. */
            | 'DIRECTIVE_DEFINITION';

          export type InfoQueryVariables = Exact<{ [key: string]: never; }>;


          export type InfoQuery = { __schema: { directives: Array<{ locations: Array<__DirectiveLocation> }> } };
          "
        `);

      validateTs(result, undefined, undefined, undefined, undefined, true);
    });

    it('should handle introspection types (__type)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Info {
          __type(name: "Post") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `);

      const result = mergeOutputs([
        await plugin(testSchema, [{ document: query }], {}, { outputFile: '' }),
      ]);

      expect(result).toMatchInlineSnapshot(`
          "/** Internal type. DO NOT USE DIRECTLY. */
          type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
          /** Internal type. DO NOT USE DIRECTLY. */
          export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
          /** An enum describing what kind of type a given \`__Type\` is. */
          export type __TypeKind =
            /** Indicates this type is a scalar. */
            | 'SCALAR'
            /** Indicates this type is an object. \`fields\` and \`interfaces\` are valid fields. */
            | 'OBJECT'
            /** Indicates this type is an interface. \`fields\`, \`interfaces\`, and \`possibleTypes\` are valid fields. */
            | 'INTERFACE'
            /** Indicates this type is a union. \`possibleTypes\` is a valid field. */
            | 'UNION'
            /** Indicates this type is an enum. \`enumValues\` is a valid field. */
            | 'ENUM'
            /** Indicates this type is an input object. \`inputFields\` is a valid field. */
            | 'INPUT_OBJECT'
            /** Indicates this type is a list. \`ofType\` is a valid field. */
            | 'LIST'
            /** Indicates this type is a non-null. \`ofType\` is a valid field. */
            | 'NON_NULL';

          export type InfoQueryVariables = Exact<{ [key: string]: never; }>;


          export type InfoQuery = { __type: { name: string | null, fields: Array<{ name: string, type: { name: string | null, kind: __TypeKind } }> | null } | null };
          "
        `);

      validateTs(result, undefined, undefined, undefined, undefined, true);
    });
  });
}

if (versionInfo.major <= 17) {
  describe('TypeScript Operations Plugin - Query introspection enums graphql@17', () => {
    it('should handle introspection types (__schema)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Info {
          __schema {
            directives {
              locations
            }
          }
        }
      `);

      const result = mergeOutputs([
        await plugin(testSchema, [{ document: query }], {}, { outputFile: '' }),
      ]);

      expect(result).toMatchInlineSnapshot(`
        "/** Internal type. DO NOT USE DIRECTLY. */
        type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
        /** Internal type. DO NOT USE DIRECTLY. */
        export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
        /** A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies. */
        export type __DirectiveLocation =
          /** Location adjacent to a query operation. */
          | 'QUERY'
          /** Location adjacent to a mutation operation. */
          | 'MUTATION'
          /** Location adjacent to a subscription operation. */
          | 'SUBSCRIPTION'
          /** Location adjacent to a field. */
          | 'FIELD'
          /** Location adjacent to a fragment definition. */
          | 'FRAGMENT_DEFINITION'
          /** Location adjacent to a fragment spread. */
          | 'FRAGMENT_SPREAD'
          /** Location adjacent to an inline fragment. */
          | 'INLINE_FRAGMENT'
          /** Location adjacent to an operation variable definition. */
          | 'VARIABLE_DEFINITION'
          /** Location adjacent to a fragment variable definition. */
          | 'FRAGMENT_VARIABLE_DEFINITION'
          /** Location adjacent to a schema definition. */
          | 'SCHEMA'
          /** Location adjacent to a scalar definition. */
          | 'SCALAR'
          /** Location adjacent to an object type definition. */
          | 'OBJECT'
          /** Location adjacent to a field definition. */
          | 'FIELD_DEFINITION'
          /** Location adjacent to an argument definition. */
          | 'ARGUMENT_DEFINITION'
          /** Location adjacent to an interface definition. */
          | 'INTERFACE'
          /** Location adjacent to a union definition. */
          | 'UNION'
          /** Location adjacent to an enum definition. */
          | 'ENUM'
          /** Location adjacent to an enum value definition. */
          | 'ENUM_VALUE'
          /** Location adjacent to an input object type definition. */
          | 'INPUT_OBJECT'
          /** Location adjacent to an input object field definition. */
          | 'INPUT_FIELD_DEFINITION'
          /** Location adjacent to a directive definition. */
          | 'DIRECTIVE_DEFINITION';

        export type InfoQueryVariables = Exact<{ [key: string]: never; }>;


        export type InfoQuery = { __schema: { directives: Array<{ locations: Array<__DirectiveLocation> }> } };
        "
      `);

      validateTs(result, undefined, undefined, undefined, undefined, true);
    });

    it('should handle introspection types (__type)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Info {
          __type(name: "Post") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `);

      const result = mergeOutputs([
        await plugin(testSchema, [{ document: query }], {}, { outputFile: '' }),
      ]);

      expect(result).toMatchInlineSnapshot(`
          "/** Internal type. DO NOT USE DIRECTLY. */
          type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
          /** Internal type. DO NOT USE DIRECTLY. */
          export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
          /** An enum describing what kind of type a given \`__Type\` is. */
          export type __TypeKind =
            /** Indicates this type is a scalar. */
            | 'SCALAR'
            /** Indicates this type is an object. \`fields\` and \`interfaces\` are valid fields. */
            | 'OBJECT'
            /** Indicates this type is an interface. \`fields\`, \`interfaces\`, and \`possibleTypes\` are valid fields. */
            | 'INTERFACE'
            /** Indicates this type is a union. \`possibleTypes\` is a valid field. */
            | 'UNION'
            /** Indicates this type is an enum. \`enumValues\` is a valid field. */
            | 'ENUM'
            /** Indicates this type is an input object. \`inputFields\` is a valid field. */
            | 'INPUT_OBJECT'
            /** Indicates this type is a list. \`ofType\` is a valid field. */
            | 'LIST'
            /** Indicates this type is a non-null. \`ofType\` is a valid field. */
            | 'NON_NULL';

          export type InfoQueryVariables = Exact<{ [key: string]: never; }>;


          export type InfoQuery = { __type: { name: string | null, fields: Array<{ name: string, type: { name: string | null, kind: __TypeKind } }> | null } | null };
          "
        `);

      validateTs(result, undefined, undefined, undefined, undefined, true);
    });
  });
}
