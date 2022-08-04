import { parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('Hasura allow list', () => {
  it('should generate a valid query_collections.yaml file', async () => {
    const expectedContent = `- name: allowed-queries
  definition:
    queries:
      - name: MyQuery
        query: |-
          query MyQuery {
            field
          }
`;
    const document = parse(/* GraphQL */ `
      query MyQuery {
        field
      }
    `);

    const content = await plugin(null, [{ document, location: '/dummy/location' }], {});

    expect(content).toBe(expectedContent);
  });
  it('should support fragments', async () => {
    const expectedContent = `- name: allowed-queries
  definition:
    queries:
      - name: MyQuery
        query: |-
          query MyQuery {
            ...MyFragment
          }
          fragment MyFragment on Query {
            field
          }
`;
    const document = parse(/* GraphQL */ `
      query MyQuery {
        ...MyFragment
      }
      fragment MyFragment on Query {
        field
      }
    `);

    const content = await plugin(null, [{ document, location: '/dummy/location' }], {});

    expect(content).toBe(expectedContent);
  });
  it('should support nested fragments', async () => {
    const expectedContent = `- name: allowed-queries
  definition:
    queries:
      - name: MyQuery
        query: |-
          query MyQuery {
            ...MyFragment
          }
          fragment MyFragment on Query {
            ...MyNestedFragment
          }
          fragment MyNestedFragment on Query {
            field
          }
`;
    const document = parse(/* GraphQL */ `
      query MyQuery {
        ...MyFragment
      }
      fragment MyFragment on Query {
        ...MyNestedFragment
      }
      fragment MyNestedFragment on Query {
        field
      }
    `);

    const content = await plugin(null, [{ document, location: '/dummy/location' }], {});

    expect(content).toBe(expectedContent);
  });
  it('should not duplicate fragments', async () => {
    const expectedContent = `- name: allowed-queries
  definition:
    queries:
      - name: MyQuery
        query: |-
          query MyQuery {
            ...MyFragment
            ...MyNestedFragment
          }
          fragment MyFragment on Query {
            ...MyNestedFragment
          }
          fragment MyNestedFragment on Query {
            field
          }
`;
    const document = parse(/* GraphQL */ `
      query MyQuery {
        ...MyFragment
        ...MyNestedFragment
      }
      fragment MyFragment on Query {
        ...MyNestedFragment
      }
      fragment MyNestedFragment on Query {
        field
      }
    `);

    const content = await plugin(null, [{ document, location: '/dummy/location' }], {});

    expect(content).toBe(expectedContent);
  });
  it('should throw on missing fragment', async () => {
    const document = parse(/* GraphQL */ `
      query MyQuery {
        ...MyNestedFragment
      }
    `);

    await expect(plugin(null, [{ document, location: '/dummy/location' }], {})).rejects.toThrow();
  });
  it('should throw on missing nested fragment', async () => {
    const document = parse(/* GraphQL */ `
      query MyQuery {
        ...MyFragment
      }
      fragment MyFragment on Query {
        ...MyNestedFragment
      }
    `);

    await expect(plugin(null, [{ document, location: '/dummy/location' }], {})).rejects.toThrow();
  });
  it('should handle multiple queries', async () => {
    const expectedContent = `- name: allowed-queries
  definition:
    queries:
      - name: MyQuery1
        query: |-
          query MyQuery1 {
            field
          }
      - name: MyQuery2
        query: |-
          query MyQuery2 {
            field
          }
      - name: MyQuery3
        query: |-
          query MyQuery3 {
            field
          }
`;
    const document = parse(/* GraphQL */ `
      query MyQuery1 {
        field
      }
      query MyQuery2 {
        field
      }
      query MyQuery3 {
        field
      }
    `);

    const content = await plugin(null, [{ document, location: '/dummy/location' }], {});

    expect(content).toBe(expectedContent);
  });
  it('should handle multiple documents', async () => {
    const expectedContent = `- name: allowed-queries
  definition:
    queries:
      - name: MyQuery1
        query: |-
          query MyQuery1 {
            field
          }
      - name: MyQuery2
        query: |-
          query MyQuery2 {
            field
          }
      - name: MyQuery3
        query: |-
          query MyQuery3 {
            field
          }
`;
    const document1 = parse(/* GraphQL */ `
      query MyQuery1 {
        field
      }
    `);
    const document2 = parse(/* GraphQL */ `
      query MyQuery2 {
        field
      }
    `);
    const document3 = parse(/* GraphQL */ `
      query MyQuery3 {
        field
      }
    `);

    const content = await plugin(
      null,
      [
        { document: document1, location: '/dummy/location' },
        { document: document2, location: '/dummy/location' },
        { document: document3, location: '/dummy/location' },
      ],
      {}
    );

    expect(content).toBe(expectedContent);
  });
  it('should assign fragments to operations correctly', async () => {
    const expectedContent = `- name: allowed-queries
  definition:
    queries:
      - name: MyQuery1
        query: |-
          query MyQuery1 {
            field
            ...MyFragment
            ...MyOtherFragment
          }
          fragment MyFragment on Query {
            field
          }
          fragment MyOtherFragment on Query {
            field
          }
      - name: MyQuery2
        query: |-
          query MyQuery2 {
            field
            ...MyFragment
          }
          fragment MyFragment on Query {
            field
          }
      - name: MyQuery3
        query: |-
          query MyQuery3 {
            field
            ...MyOtherFragment
          }
          fragment MyOtherFragment on Query {
            field
          }
      - name: MyQuery4
        query: |-
          query MyQuery4 {
            field
          }
`;
    const document = parse(/* GraphQL */ `
      query MyQuery1 {
        field
        ...MyFragment
        ...MyOtherFragment
      }
      query MyQuery2 {
        field
        ...MyFragment
      }
      query MyQuery3 {
        field
        ...MyOtherFragment
      }
      query MyQuery4 {
        field
      }
      fragment MyFragment on Query {
        field
      }
      fragment MyOtherFragment on Query {
        field
      }
    `);

    const content = await plugin(null, [{ document, location: '/dummy/location' }], {});

    expect(content).toBe(expectedContent);
  });
  it('should skip anonymous operations', async () => {
    const expectedContent = `- name: allowed-queries
  definition:
    queries: []
`;
    const document = parse(/* GraphQL */ `
      query {
        field
      }
    `);

    const content = await plugin(null, [{ document, location: '/dummy/location' }], {});

    expect(content).toBe(expectedContent);
  });
});
