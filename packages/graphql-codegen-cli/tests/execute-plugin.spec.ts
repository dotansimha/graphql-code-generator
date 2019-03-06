import { parse } from 'graphql';
import typescriptClientPlugin from 'graphql-codegen-typescript-client';
import { executePlugin } from '../src/execute-plugin';

describe('executePlugin', () => {
  it('Should throw a detailed error message with source file and position for an invalid GraphQL document', () => {
    const options = {
      allPlugins: [
        {
          'typescript-common': {}
        },
        {
          'typescript-client': {}
        }
      ],
      config: {},
      schema: parse(`
        type Character {
          id: ID!
          name: String!
          appearsIn: String!
          friends: [Character]!
        }

        type Query {
          hero: Character!
        }
      `),
      documents: [
        {
          filePath: 'a/random/path/some.query.graphql',
          content: parse(`
            {
              hero {
                ...NameAndAppearancesAndFriends
              }
            }

            fragment NameAndAppearancesAndFriends on Character {
              name
              appearsIn
              friends {
                ...NameAndAppearancesAndFriends
              }
            }
          `)
        }
      ],
      name: 'typescript-client',
      outputFilename: 'a/random/path/output.ts'
    };

    return executePlugin(options, typescriptClientPlugin).then(
      () => {
        return Promise.reject(new Error('Error was not thrown as expected'));
      },
      errors => {
        const error = errors[Symbol.iterator]().next().value;

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toEqual('GraphQLDocumentError');
        expect(error.message).toEqual(
          'GraphQLDocumentError: Cannot spread fragment "NameAndAppearancesAndFriends" within itself.'
        );
        expect(error.stack).toEqual(
          [
            'GraphQLDocumentError: Cannot spread fragment "NameAndAppearancesAndFriends" within itself.',
            '    at a/random/path/some.query.graphql:12:17'
          ].join('\n')
        );
      }
    );
  });
});
