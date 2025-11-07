import { buildSchema } from 'graphql';
import '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

describe('customDirectives.sematicNonNull', () => {
  it('allowSemanticNonNull - should build strict type if annotated by @semanticNonNull directive', async () => {
    const testingSchema = buildSchema(/* GraphQL */ `
      directive @semanticNonNull(levels: [Int] = [0]) on FIELD_DEFINITION

      type TestingType {
        field: String @semanticNonNull
        fieldLevel0: String @semanticNonNull(levels: [0])
        fieldLevel1: String @semanticNonNull(levels: [1])
        fieldBothLevels: String @semanticNonNull(levels: [0, 1])
        list: [String] @semanticNonNull
        listLevel0: [String] @semanticNonNull(levels: [0])
        listLevel1: [String] @semanticNonNull(levels: [1])
        listBothLevels: [String] @semanticNonNull(levels: [0, 1])
        nonNullableList: [String]! @semanticNonNull
        nonNullableListLevel0: [String]! @semanticNonNull(levels: [0])
        nonNullableListLevel1: [String]! @semanticNonNull(levels: [1])
        nonNullableListBothLevels: [String]! @semanticNonNull(levels: [0, 1])
        listWithNonNullableItem: [String!] @semanticNonNull
        listWithNonNullableItemLevel0: [String!] @semanticNonNull(levels: [0])
        listWithNonNullableItemLevel1: [String!] @semanticNonNull(levels: [1])
        listWithNonNullableItemBothLevels: [String!] @semanticNonNull(levels: [0, 1])
        nonNullableListWithNonNullableItem: [String!]! @semanticNonNull
        nonNullableListWithNonNullableItemLevel0: [String!]! @semanticNonNull(levels: [0])
        nonNullableListWithNonNullableItemLevel1: [String!]! @semanticNonNull(levels: [1])
        nonNullableListWithNonNullableItemBothLevels: [String!]! @semanticNonNull(levels: [0, 1])
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
        field?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        fieldLevel0?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        fieldLevel1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
        fieldBothLevels?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        list?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
        listLevel0?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
        listLevel1?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
        listBothLevels?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        nonNullableList?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
        nonNullableListLevel0?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
        nonNullableListLevel1?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        nonNullableListBothLevels?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        listWithNonNullableItem?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        listWithNonNullableItemLevel0?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        listWithNonNullableItemLevel1?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
        listWithNonNullableItemBothLevels?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        nonNullableListWithNonNullableItem?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        nonNullableListWithNonNullableItemLevel0?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        nonNullableListWithNonNullableItemLevel1?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
        nonNullableListWithNonNullableItemBothLevels?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
      };
    `);
  });
});
