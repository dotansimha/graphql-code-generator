import { createGraph, waitForDependencies } from '../src/utils/graph';
import { resolve } from 'path';

describe('Graph', () => {
  it('should put outputs in a proper order (static files)', () => {
    const fooFile = './foo.ts';
    const schemaFile = 'schema.graphql';

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: './schema.graphql',
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([schemaFile, fooFile]);
  });

  it('should put outputs in a proper order (static files)', () => {
    const fooFile = './foo.ts';
    const barFile = './bar.ts';
    const schemaFile = 'schema.graphql';

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: './schema.graphql',
          plugins: {},
        },
        [barFile]: {
          documents: [fooFile],
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([schemaFile, fooFile, barFile]);
  });

  it('should put outputs in a proper order (glob)', () => {
    const fooFile = './foo.ts';
    const schemaFile = 'schema.graphql';

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: ['*.graphql'],
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([schemaFile, fooFile]);
  });

  it('should put outputs in a proper order (url)', () => {
    const fooFile = './foo.ts';
    const schemaFile = 'schema.graphql';

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: 'http://api.com',
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([fooFile, schemaFile]);
  });

  it('should put outputs in a proper order when absolute paths are used as keys (static files)', () => {
    const fooFile = './foo.ts';
    const schemaFile = resolve(process.cwd(), 'schema.graphql');

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: 'schema.graphql',
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([schemaFile, fooFile]);
  });

  it('should put outputs in a proper order when absolute paths are used in documents or schemas (static files)', () => {
    const fooFile = './foo.ts';
    const schemaFile = 'schema.graphql';

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: resolve(process.cwd(), 'schema.graphql'),
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([schemaFile, fooFile]);
  });

  test.todo(
    'should put outputs in a proper order when absolute paths are used (glob)' /*, () => {
      const fooFile = './foo.ts';
      const schemaFile = resolve(process.cwd(), 'schema.graphql');

      const graph = createGraph({
        generates: {
          [fooFile]: {
            schema: ['*.graphql'],
            plugins: {},
          },
          [schemaFile]: {
            plugins: {},
          },
        },
        cwd: process.cwd(),
      });

      expect(graph.overallOrder()).toEqual([schemaFile, fooFile]);
    } */
  );

  it('should resolve outputs in a proper order', async () => {
    const fooFile = './foo.ts';
    const barFile = './bar.ts';
    const schemaFile = 'schema.graphql';
    const order = [schemaFile, fooFile, barFile];

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: './schema.graphql',
          plugins: {},
        },
        [barFile]: {
          documents: [fooFile],
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual(order);

    const resolveOrder = [];

    async function waitFor(output: string) {
      await waitForDependencies({ graph, output });
      resolveOrder.push(output);
    }

    function resolveAfter(output: string, time: number) {
      setTimeout(() => {
        graph.getNodeData(output).success();
      }, time);
    }

    resolveAfter(barFile, 10);
    resolveAfter(fooFile, 20);
    resolveAfter(schemaFile, 30);

    await Promise.all([waitFor(fooFile), waitFor(barFile), waitFor(schemaFile)]);

    expect(resolveOrder).toEqual(order);
  });
});
