import { plugin } from '../src';
import { validateTs } from '@graphql-codegen/testing';
import { buildClientSchema, GraphQLSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { RawGraphQLTQLPluginConfig } from '../src/config';

const validate = async (
  content: Types.PluginOutput,
  config: TypeScriptPluginConfig & RawGraphQLTQLPluginConfig,
  pluginSchema: GraphQLSchema
) => {
  const m = mergeOutputs([await tsPlugin(pluginSchema, [], config, { outputFile: '' }), content]);

  validateTs(m);

  return m;
};

const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

describe('TQL', () => {
  it('Should generate Sdk correctly', async () => {
    const config = {};
    const result = (await plugin(schema, [], config, {
      outputFile: 'graphql.ts',
    })) as Types.ComplexPluginOutput;

    const output = await validate(result, config, schema);

    expect(output).toMatchSnapshot();
  });
});
