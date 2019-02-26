import {
  SelectionSetToObject,
  PrimitiveField,
  PrimitiveAliasedFields,
  ISelectionSetToObjectClass
} from 'graphql-codegen-visitor-plugin-common';
import { GraphQLObjectType, GraphQLNonNull, GraphQLList, isNonNullType, isListType } from 'graphql';

export class FlowSelectionSetToObject extends SelectionSetToObject {
  protected getClassCreator(): ISelectionSetToObjectClass {
    return FlowSelectionSetToObject;
  }

  protected buildPrimitiveFields(parentName: string, fields: PrimitiveField[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    return `$Pick<${parentName}, { ${fields.map(fieldName => `${fieldName}: *`).join(', ')} }>`;
  }

  protected buildAliasedPrimitiveFields(parentName: string, fields: PrimitiveAliasedFields[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    return `{ ${fields
      .map(aliasedField => `${aliasedField.alias}: $ElementType<${parentName}, '${aliasedField.fieldName}'>`)
      .join(', ')} }`;
  }

  protected clearOptional(str: string): string {
    if (str.startsWith('?')) {
      return str.substring(1);
    }

    return str;
  }

  protected wrapTypeWithModifiers(
    baseType: string,
    type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>
  ): string {
    if (isNonNullType(type)) {
      return this.clearOptional(this.wrapTypeWithModifiers(baseType, type.ofType));
    } else if (isListType(type)) {
      const innerType = this.wrapTypeWithModifiers(baseType, type.ofType);

      return `?Array<${innerType}>`;
    } else {
      return `?${baseType}`;
    }
  }
}
