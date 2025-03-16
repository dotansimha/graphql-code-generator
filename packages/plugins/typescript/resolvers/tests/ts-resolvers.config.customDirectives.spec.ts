import { buildSchema } from 'graphql';
import '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

describe('customDirectives.sematicNonNull', () => {
  it('allowSemanticNonNull - should build strict type if annotated by @semanticNonNull directive', async () => {
    const testingSchema = buildSchema(/* GraphQL */ `
      directive @semanticNonNull(levels: [Int] = [0]) on FIELD_DEFINITION

      type TestingType {
        nonNullableField: String! @semanticNonNull
        nonNullableList: [String]! @semanticNonNull
        nullableField: String
        nullableList: [String]
        semanticNonNullField: String @semanticNonNull
        semanticNonNullList: [String] @semanticNonNull
      }
    `);

    const result = await plugin(
      testingSchema,
      [],
      {
        customDirectives: { semanticNonNull: true },
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type TestingTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['TestingType'] = ResolversParentTypes['TestingType']> = {
        nonNullableField?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        nonNullableList?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
        nullableField?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
        nullableList?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
        semanticNonNullField?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        semanticNonNullList?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });
});
