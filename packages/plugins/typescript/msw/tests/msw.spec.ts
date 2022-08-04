import { pascalCase } from 'change-case-all';
import { parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('msw', () => {
  const queryName = 'User';
  const mutationName = 'UpdateUser';
  const documents = [
    { document: parse(`query ${queryName} { name }`) },
    { document: parse(`mutation ${mutationName} { name }`) },
  ];

  it('Should generate mocks based on queries and mutations', async () => {
    const result = await plugin(null, documents, {});

    // handler function names
    expect(result.content).toContain(`mock${queryName}Query`);
    expect(result.content).toContain(`mock${mutationName}Mutation`);

    // handler strings
    expect(result.content).toContain(`'${queryName}',`);
    expect(result.content).toContain(`'${mutationName}',`);

    expect(result.prepend).toMatchSnapshot('imports');
    expect(result.content).toMatchSnapshot('content');
  });

  it('Should generate a link with an endpoint when passed a link variable', async () => {
    const link = { name: 'api', endpoint: 'http://localhost:3000/graphql' };
    const capitalizedName = pascalCase(link.name);

    const result = await plugin(null, documents, { link });

    // endpoint definition
    expect(result.content).toContain(`const ${link.name} = graphql.link('${link.endpoint}')`);

    // endpoint used instead of `graphql`
    expect(result.content).not.toContain(`graphql.query`);
    expect(result.content).not.toContain(`graphql.mutation`);
    expect(result.content).toContain(`${link.name}.query`);
    expect(result.content).toContain(`${link.name}.mutation`);

    // handler function names
    expect(result.content).toContain(`mock${queryName}Query${capitalizedName}`);
    expect(result.content).toContain(`mock${mutationName}Mutation${capitalizedName}`);

    expect(result.content).toMatchSnapshot('content with a link/endpoint');
  });

  it('Should generate JSDoc documentation with variables and selection from the operations themselves', async () => {
    const variables = ['id', 'offset', 'limit'];
    const input = variables.map(v => `$${v}: Int`).join(', ');

    const fields = ['name', 'phone', 'country'];
    const selection = fields.join(', ');

    const documents = [
      { document: parse(`query ${queryName}(${input}) { ${selection} }`) },
      { document: parse(`mutation ${mutationName}(${input}) { ${selection} }`) },
    ];

    const result = await plugin(null, documents, {});

    expect(result.content).toContain(`const { ${variables.join(', ')} } = req.variables`);
    expect(result.content).toContain(`ctx.data({ ${selection} })`);
    expect(result.content).toMatchSnapshot('content with variables and selection JSDoc documentation');
  });

  it('Should use the "importOperationTypesFrom" setting', async () => {
    const importOperationTypesFrom = 'Types';
    const result = await plugin(null, documents, { importOperationTypesFrom });

    // handler variable and result type
    const queryVariablesType = `${importOperationTypesFrom}.${queryName}QueryVariables`;
    const queryType = `${importOperationTypesFrom}.${queryName}Query`;
    expect(result.content).toContain(`GraphQLRequest<${queryVariablesType}>`);
    expect(result.content).toContain(`GraphQLContext<${queryType}>`);
    expect(result.content).toContain(`graphql.query<${queryType}, ${queryVariablesType}>`);

    const mutationVariablesType = `${importOperationTypesFrom}.${mutationName}MutationVariables`;
    const mutationType = `${importOperationTypesFrom}.${mutationName}Mutation`;
    expect(result.content).toContain(`GraphQLRequest<${mutationVariablesType}>`);
    expect(result.content).toContain(`GraphQLContext<${mutationType}>`);
    expect(result.content).toContain(`graphql.mutation<${mutationType}, ${mutationVariablesType}>`);

    expect(result.content).toMatchSnapshot('content with types configured via importOperationTypesFrom');
  });
});
