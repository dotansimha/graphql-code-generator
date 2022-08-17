import { ScalarsMap, ConvertNameFn, AvoidOptionalsConfig } from '../types.js';
import { GraphQLObjectType, GraphQLInterfaceType, GraphQLOutputType, GraphQLNamedType } from 'graphql';

export type PrimitiveField = { isConditional: boolean; fieldName: string };
export type PrimitiveAliasedFields = { alias: string; fieldName: string };
export type LinkField = { alias: string; name: string; type: string; selectionSet: string };
export type NameAndType = { name: string; type: string };
export type ProcessResult = null | Array<NameAndType | string>;

export type SelectionSetProcessorConfig = {
  namespacedImportName: string | null;
  convertName: ConvertNameFn<any>;
  enumPrefix: boolean | null;
  scalars: ScalarsMap;
  formatNamedField(name: string, type?: GraphQLOutputType | GraphQLNamedType | null, isConditional?: boolean): string;
  wrapTypeWithModifiers(baseType: string, type: GraphQLOutputType | GraphQLNamedType): string;
  avoidOptionals?: AvoidOptionalsConfig;
  autoSelectId: boolean;
};

export class BaseSelectionSetProcessor<Config extends SelectionSetProcessorConfig> {
  constructor(public config: Config) {}

  buildFieldsIntoObject(allObjectsMerged: string[]): string {
    return `{ ${allObjectsMerged.join(', ')} }`;
  }

  buildSelectionSetFromStrings(pieces: string[]): string {
    if (pieces.length === 0) {
      return null;
    }
    if (pieces.length === 1) {
      return pieces[0];
    }
    return `(\n  ${pieces.join(`\n  & `)}\n)`;
  }

  transformPrimitiveFields(
    _schemaType: GraphQLObjectType | GraphQLInterfaceType,
    _fields: PrimitiveField[]
  ): ProcessResult {
    throw new Error(
      `Please override "transformPrimitiveFields" as part of your BaseSelectionSetProcessor implementation!`
    );
  }

  transformAliasesPrimitiveFields(
    _schemaType: GraphQLObjectType | GraphQLInterfaceType,
    _fields: PrimitiveAliasedFields[]
  ): ProcessResult {
    throw new Error(
      `Please override "transformAliasesPrimitiveFields" as part of your BaseSelectionSetProcessor implementation!`
    );
  }

  transformLinkFields(_fields: LinkField[]): ProcessResult {
    throw new Error(`Please override "transformLinkFields" as part of your BaseSelectionSetProcessor implementation!`);
  }

  transformTypenameField(_type: string, _name: string): ProcessResult {
    throw new Error(
      `Please override "transformTypenameField" as part of your BaseSelectionSetProcessor implementation!`
    );
  }
}
