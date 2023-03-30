import { buildSchema, FragmentDefinitionNode, OperationDefinitionNode, parse, Kind } from 'graphql';
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

  describe('when documentMode "documentNodeImportFragments"', () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        a: A
      }

      type A {
        foo: String
        bar: String
      }
    `);

    it('does not import FragmentDocs', () => {
      const fileName = 'fooBarQuery';
      const importPath = `src/queries/${fileName}`;

      const document = parse(
        `query fooBarQuery {
          a {
            ...fields
          }
        }
        fragment fields on A {
          foo
          bar
        }
      `
      );

      const visitor = new ClientSideBaseVisitor(
        schema,
        (document.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
          fragmentDef => ({
            node: fragmentDef,
            name: fragmentDef.name.value,
            onType: fragmentDef.typeCondition.name.value,
            isExternal: false,
          })
        ),
        {
          emitLegacyCommonJSImports: true,
          importDocumentNodeExternallyFrom: 'near-operation-file',
          documentMode: DocumentMode.documentNodeImportFragments,
          fragmentImports: [
            {
              baseDir: '/',
              baseOutputDir: '',
              outputPath: '',
              importSource: {
                path: '~types',
                identifiers: [
                  { name: 'FieldsFragmentDoc', kind: 'document' },
                  { name: 'FieldsFragment', kind: 'type' },
                ],
              },
              emitLegacyCommonJSImports: true,
              typesImport: false,
            },
          ],
        },
        {},
        [{ document, location: importPath }]
      );

      visitor.OperationDefinition(document.definitions[0] as OperationDefinitionNode);

      const imports = visitor.getImports();
      for (const i of imports) {
        expect(i).not.toContain('FragmentDoc');
      }
    });
  });
});
