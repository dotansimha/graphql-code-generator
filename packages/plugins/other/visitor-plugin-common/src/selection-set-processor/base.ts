import { ScalarsMap, ConvertNameFn, AvoidOptionalsConfig } from '../types';
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
  formatNamedField(name: string, type?: GraphQLOutputType | GraphQLNamedType | null): string;
  wrapTypeWithModifiers(baseType: string, type: GraphQLOutputType | GraphQLNamedType): string;
  avoidOptionals?: AvoidOptionalsConfig;
};

export class BaseSelectionSetProcessor<Config extends SelectionSetProcessorConfig> {
  constructor(public config: Config) {}

  buildFieldsIntoObject(allObjectsMerged: string[]): string {
    return `{ ${allObjectsMerged.join(', ')} }`;
  }

  buildSelectionSetFromStrings(pieces: string[], isConditional = false, isInlineFragment = false): string {
    if (pieces.length === 0) {
      return null;
    } else if (pieces.length === 1) {
      return isConditional ? `( {} | ${pieces[0]} )` : pieces[0];
    } else {
      if (!isConditional) {
        return `(\n  ${pieces.join(`\n  & `)} )`;
      }

      if (!isInlineFragment) {
        const stringifiedPieces = `(\n  ${pieces.join(`\n  & `)}\n)`;
        return `(\n  {} | ${stringifiedPieces} )`;
      }

      let typeObject = '';
      const otherPieces = [];
      pieces.forEach(s => {
        if (s.startsWith('{ __typename')) {
          typeObject = s;
        } else {
          otherPieces.push(s);
        }
      });

      const adjustedPieces: string[] = [];

      if (typeObject) {
        adjustedPieces.push(`${typeObject}`);
      }
      if (otherPieces.length) {
        const stringOtherPieces =
          otherPieces.length === 1 ? otherPieces[0] : `(\n    ${otherPieces.join(`    & `)}\n  )`;
        adjustedPieces.push(`(\n    {} | ${stringOtherPieces} )`);
      }

      return `(\n  ${adjustedPieces.join(`\n  & `)} )`;
    }
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
