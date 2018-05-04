import * as fs from 'fs';
import gql from 'graphql-tag';
import { introspectionToGraphQLSchema, transformDocument, schemaToTemplateContext } from 'graphql-codegen-core';
import { compileTemplate } from '../src';

describe('Custom Output Processor', () => {
  const schema = introspectionToGraphQLSchema(
    JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString())
  );

  const templateContext = schemaToTemplateContext(schema);

  it('should execute the processor', async () => {
    const processor = jest.fn();
    processor.mockReturnValueOnce([]);
    await compileTemplate(processor, templateContext);

    expect(processor.mock.calls.length).toBe(1);
  });

  it('should throw and exception when processor returns an incorrect value', async () => {
    const processor = jest.fn();
    processor.mockReturnValueOnce({});
    let error = null;

    try {
      await compileTemplate(processor, templateContext);
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
  });

  it('should handle return value of a Promise correctly', async () => {
    const processor = jest.fn();
    processor.mockReturnValueOnce(Promise.resolve([]));
    const result = await compileTemplate(processor, templateContext);

    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toEqual([]);
  });

  it('should call the processor with the correct arguments', async () => {
    const documents = gql`
      query myFeed {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }
    `;

    const transformedDocument = transformDocument(schema, documents);
    const processor = jest.fn();
    processor.mockReturnValueOnce([]);
    await compileTemplate(processor, templateContext, [transformedDocument]);

    expect(processor.mock.calls[0][0]).toBe(templateContext);
    expect(processor.mock.calls[0][1].hasFragments).toBeFalsy();
    expect(processor.mock.calls[0][1].hasOperations).toBeTruthy();
    expect(processor.mock.calls[0][1].operations.length).toBe(1);
  });
});
