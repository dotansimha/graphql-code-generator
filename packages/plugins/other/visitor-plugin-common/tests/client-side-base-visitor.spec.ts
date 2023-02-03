import { buildSchema, OperationDefinitionNode, parse } from 'graphql';
import { ClientSideBaseVisitor, DocumentMode } from '../src/client-side-base-visitor.js';

describe('getImports', () => {
  describe('when documentMode "external", importDocumentNodeExternallyFrom is "near-operation-file"', () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        a: A
      }

      type A {
        foo: String
        bar: String
      }
    `);

    describe('when emitLegacyCommonJSImports is true', () => {
      it('does not append `.js` to Operations import path', () => {
        const fileName = 'fooBarQuery';
        const importPath = `src/queries/${fileName}`;

        const document = parse(
          `query fooBarQuery {
            a {
              foo
              bar
            }
          }
        `
        );

        const visitor = new ClientSideBaseVisitor(
          schema,
          [],
          {
            emitLegacyCommonJSImports: true,
            importDocumentNodeExternallyFrom: 'near-operation-file',
            documentMode: DocumentMode.external,
          },
          {},
          [{ document, location: importPath }]
        );

        visitor.OperationDefinition(document.definitions[0] as OperationDefinitionNode);

        const imports = visitor.getImports();
        expect(imports[0]).toBe(`import * as Operations from './${fileName}';`);
      });
    });

    describe('when emitLegacyCommonJSImports is false', () => {
      it('appends `.js` to Operations import path', () => {
        const fileName = 'fooBarQuery';
        const importPath = `src/queries/${fileName}`;

        const document = parse(
          `query fooBarQuery {
            a {
              foo
              bar
            }
          }
        `
        );

        const visitor = new ClientSideBaseVisitor(
          schema,
          [],
          {
            emitLegacyCommonJSImports: false,
            importDocumentNodeExternallyFrom: 'near-operation-file',
            documentMode: DocumentMode.external,
          },
          {},
          [{ document, location: importPath }]
        );

        visitor.OperationDefinition(document.definitions[0] as OperationDefinitionNode);

        const imports = visitor.getImports();
        expect(imports[0]).toBe(`import * as Operations from './${fileName}.js';`);
      });
    });
  });

  describe('when documentMode "external", importDocumentNodeExternallyFrom is relative path', () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        a: A
      }

      type A {
        foo: String
        bar: String
      }
    `);

    describe('when emitLegacyCommonJSImports is false', () => {
      it('preserves `.js` on Operations import path', () => {
        const fileName = 'fooBarQuery';
        const importPath = `./src/queries/${fileName}.js`;

        const document = parse(
          `query fooBarQuery {
            a {
              foo
              bar
            }
          }
        `
        );

        const visitor = new ClientSideBaseVisitor(
          schema,
          [],
          {
            emitLegacyCommonJSImports: false,
            importDocumentNodeExternallyFrom: importPath,
            documentMode: DocumentMode.external,
          },
          {},
          [{ document, location: importPath }]
        );

        visitor.OperationDefinition(document.definitions[0] as OperationDefinitionNode);

        const imports = visitor.getImports();
        expect(imports[0]).toBe(`import * as Operations from '${importPath}';`);
      });
    });
  });
});
