import { ScalarsMap, ConvertNameFn } from '../types';
import { GraphQLObjectType, GraphQLInterfaceType, GraphQLNonNull, GraphQLList } from 'graphql';

export type PrimitiveField = string;
export type PrimitiveAliasedFields = { alias: string; fieldName: string };
export type LinkField = { alias: string; name: string; type: string; selectionSet: string };
export type NameAndType = { name: string; type: string };
export type ProcessResult = null | Array<NameAndType | string>;

export type SelectionSetProcessorConfig = {
  namespacedImportName: string | null;
  convertName: ConvertNameFn<any>;
  enumPrefix: boolean | null;
  scalars: ScalarsMap;
  formatNamedField: (name: string) => string;
  wrapTypeWithModifiers: (
    baseType: string,
    type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>
  ) => string;
};

export class BaseSelectionSetProcessor<Config extends SelectionSetProcessorConfig> {
  constructor(public config: Config) {}

  buildFieldsIntoObject(allObjectsMerged: string[]): string {
    return `{ ${allObjectsMerged.join(', ')} }`;
  }

  buildSelectionSetFromStrings(pieces: string[]): string {
    if (pieces.length === 0) {
      return null;
    } else if (pieces.length === 1) {
      return pieces[0];
    } else {
      return `(\n  ${pieces.join(`\n  & `)}\n)`;
    }
  }

  transformPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveField[]
  ): ProcessResult {
    throw new Error(
      `Please override "transformPrimitiveFields" as part of your BaseSelectionSetProcessor implementation!`
    );
  }

  transformAliasesPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveAliasedFields[]
  ): ProcessResult {
    throw new Error(
      `Please override "transformAliasesPrimitiveFields" as part of your BaseSelectionSetProcessor implementation!`
    );
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    throw new Error(`Please override "transformLinkFields" as part of your BaseSelectionSetProcessor implementation!`);
  }

  transformTypenameField(type: string, name: string): ProcessResult {
    throw new Error(
      `Please override "transformTypenameField" as part of your BaseSelectionSetProcessor implementation!`
    );
  }
}
