import { plugin } from '@graphql-codegen/typescript-operations';
import { buildSchema, parse } from 'graphql';
import { join } from 'path';
import { readFile } from 'fs/promises';

it('should not throw error heap out of memory', async () => {
  const schema = buildSchema(await readFile(join(__dirname, 'schema.graphql'), 'utf8'));

  const document = /* GraphQL */ `
    fragment WPColumns on WpCoreColumnsBlock {
      # removing next selection make test pass
      innerBlocks {
        innerBlocks {
          ... on WpCoreColumnsBlock {
            # removing next selection make test pass
            innerBlocks {
              innerBlocks {
                ... on WpCoreColumnsBlock {
                  # removing next selection make test pass
                  innerBlocks {
                    innerBlocks {
                      ...WpCoreImageBlockForGalleryFragment
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    fragment WpCoreImageBlockForGalleryFragment on WpCoreImageBlock {
      __typename
    }
  `;

  const ast = parse(document);

  const config = { skipTypename: true, preResolveTypes: false };
  const { content } = await plugin(
    schema,
    [
      {
        location: 'test.ts',
        document: ast,
      },
    ],
    config,
    { outputFile: '' }
  );

  expect(content).toBeTruthy();
});
