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

    describe('when importExtension is set to .mjs', () => {
      it('appends `.mjs` to Operations import path', () => {
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
            importExtension: '.mjs',
            importDocumentNodeExternallyFrom: 'near-operation-file',
            documentMode: DocumentMode.external,
          },
          {},
          [{ document, location: importPath }]
        );

        visitor.OperationDefinition(document.definitions[0] as OperationDefinitionNode);

        const imports = visitor.getImports();
        expect(imports[0]).toBe(`import * as Operations from './${fileName}.mjs';`);
      });
    });

    describe('when importExtension is set to empty string', () => {
      it('does not append extension to Operations import path', () => {
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
            importExtension: '',
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

    describe('when both importExtension and emitLegacyCommonJSImports are set', () => {
      it('uses importExtension over emitLegacyCommonJSImports', () => {
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
            importExtension: '.mjs',
            emitLegacyCommonJSImports: false,
            importDocumentNodeExternallyFrom: 'near-operation-file',
            documentMode: DocumentMode.external,
          },
          {},
          [{ document, location: importPath }]
        );

        visitor.OperationDefinition(document.definitions[0] as OperationDefinitionNode);

        const imports = visitor.getImports();
        expect(imports[0]).toBe(`import * as Operations from './${fileName}.mjs';`);
      });

      it('uses importExtension set to empty string even when emitLegacyCommonJSImports is false', () => {
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
            importExtension: '',
            emitLegacyCommonJSImports: false,
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
              importExtension: '',
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

  describe('when documentMode "graphQLTag"', () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        a: A
      }

      type A {
        foo: String
        bar: String
      }
    `);

    it('imports FragmentDocs', () => {
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
          documentMode: DocumentMode.graphQLTag,
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
              importExtension: '',
              typesImport: false,
            },
          ],
        },
        {},
        [{ document, location: importPath }]
      );

      visitor.OperationDefinition(document.definitions[0] as OperationDefinitionNode);

      const imports = visitor.getImports();
      expect(imports.some(i => i.includes('FragmentDoc'))).toBeTruthy();
    });
  });
});

describe('includeExternalFragments', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      a: A
    }

    type A {
      foo: String
      bar: String
    }
  `);

  const document = parse(`
    query fooBarQuery {
      a {
        ...ExternalA
      }
    }
    `);

  const externalFragments = parse(`
    fragment ExternalA on A {
      foo
      bar
    }
    `)
    .definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION)
    .map(fragmentDef => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: true,
    }));

  it('should not include external fragments', () => {
    const visitor = new ClientSideBaseVisitor(schema, externalFragments, {}, {});

    visitor.OperationDefinition(document.definitions[0] as OperationDefinitionNode);

    expect(visitor.fragments).toBe('');
  });

  it('should include external fragments', () => {
    const visitor = new ClientSideBaseVisitor(
      schema,
      externalFragments,
      {
        includeExternalFragments: true,
      },
      {}
    );

    expect(visitor.fragments).toContain('ExternalAFragment');
  });
});
