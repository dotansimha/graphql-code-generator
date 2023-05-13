import { GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType, GraphQLOutputType } from 'graphql';
import { AvoidOptionalsConfig, ConvertNameFn, ScalarsMap } from '../types.js';

export type PrimitiveField = { isConditional: boolean; fieldName: string };
export type PrimitiveAliasedFields = { alias: string; fieldName: string };
export type LinkField = { alias: string; name: string; type: string; selectionSet: string };
export type NameAndType = { name: string; type: string };
export type ProcessResult = null | Array<NameAndType | string>;

export type SelectionSetProcessorConfig = {
  namespacedImportName: string | null;
  convertName: ConvertNameFn<any>;
  enumPrefix: boolean | null;
  enumSuffix: boolean | null;
  scalars: ScalarsMap;
  formatNamedField(
    name: string,
    type?: GraphQLOutputType | GraphQLNamedType | null,
    isConditional?: boolean,
    isOptional?: boolean
  ): string;
  wrapTypeWithModifiers(baseType: string, type: GraphQLOutputType | GraphQLNamedType): string;
  avoidOptionals?: AvoidOptionalsConfig | boolean;
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
    _fields: PrimitiveField[],
    _unsetTypes?: boolean
  ): ProcessResult {
    throw new Error(
      `Please override "transformPrimitiveFields" as part of your BaseSelectionSetProcessor implementation!`
    );
  }

  transformAliasesPrimitiveFields(
    _schemaType: GraphQLObjectType | GraphQLInterfaceType,
    _fields: PrimitiveAliasedFields[],
    _unsetTypes?: boolean
  ): ProcessResult {
    throw new Error(
      `Please override "transformAliasesPrimitiveFields" as part of your BaseSelectionSetProcessor implementation!`
    );
  }

  transformLinkFields(_fields: LinkField[], _unsetTypes?: boolean): ProcessResult {
    throw new Error(`Please override "transformLinkFields" as part of your BaseSelectionSetProcessor implementation!`);
  }

  transformTypenameField(_type: string, _name: string): ProcessResult {
    throw new Error(
      `Please override "transformTypenameField" as part of your BaseSelectionSetProcessor implementation!`
    );
  }
}
