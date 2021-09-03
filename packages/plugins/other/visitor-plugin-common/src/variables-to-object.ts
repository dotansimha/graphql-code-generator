import { Kind, TypeNode, VariableNode, NameNode, ValueNode, DirectiveNode } from 'graphql';
import { indent, getBaseTypeNode } from './utils';
import {
  NormalizedScalarsMap,
  ConvertNameFn,
  ParsedEnumValuesMap,
  ParsedDirectiveArgumentAndInputFieldMap,
} from './types';
import { BaseVisitorConvertOptions } from './base-visitor';
import autoBind from 'auto-bind';

export interface InterfaceOrVariable {
  name?: NameNode;
  variable?: VariableNode;
  type: TypeNode;
  defaultValue?: ValueNode;
  directives?: ReadonlyArray<DirectiveNode>;
}

export class OperationVariablesToObject {
  constructor(
    protected _scalars: NormalizedScalarsMap,
    protected _convertName: ConvertNameFn<BaseVisitorConvertOptions>,
    protected _namespacedImportName: string | null = null,
    protected _enumNames: string[] = [],
    protected _enumPrefix = true,
    protected _enumValues: ParsedEnumValuesMap = {},
    protected _applyCoercion: Boolean = false,
    protected _directiveArgumentAndInputFieldMapping: ParsedDirectiveArgumentAndInputFieldMap = {}
  ) {
    autoBind(this);
  }

  getName<TDefinitionType extends InterfaceOrVariable>(node: TDefinitionType): string {
    if (node.name) {
      if (typeof node.name === 'string') {
        return node.name;
      }

      return node.name.value;
    } else if (node.variable) {
      return node.variable.name.value;
    }

    return null;
  }

  transform<TDefinitionType extends InterfaceOrVariable>(variablesNode: ReadonlyArray<TDefinitionType>): string {
    if (!variablesNode || variablesNode.length === 0) {
      return null;
    }

    return (
      variablesNode.map(variable => indent(this.transformVariable(variable))).join(`${this.getPunctuation()}\n`) +
      this.getPunctuation()
    );
  }

  protected getScalar(name: string): string {
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';

    return `${prefix}Scalars['${name}']`;
  }

  protected getDirectiveMapping(name: string): string {
    return `Directives['${name}']`;
  }

  protected getDirectiveOverrideType(directives: ReadonlyArray<DirectiveNode>): string | null {
    if (!this._directiveArgumentAndInputFieldMapping) return null;

    const type = directives
      .map(directive => {
        const directiveName = directive.name.value;
        if (this._directiveArgumentAndInputFieldMapping[directiveName]) {
          return this.getDirectiveMapping(directiveName);
        }
        return null;
      })
      .reverse()
      .find(a => !!a);

    return type || null;
  }

  protected transformVariable<TDefinitionType extends InterfaceOrVariable>(variable: TDefinitionType): string {
    let typeValue = null;
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';

    if (typeof variable.type === 'string') {
      typeValue = variable.type;
    } else {
      const baseType = getBaseTypeNode(variable.type);
      const overrideType = variable.directives ? this.getDirectiveOverrideType(variable.directives) : null;
      const typeName = baseType.name.value;

      if (overrideType) {
        typeValue = overrideType;
      } else if (this._scalars[typeName]) {
        typeValue = this.getScalar(typeName);
      } else if (this._enumValues[typeName] && this._enumValues[typeName].sourceFile) {
        typeValue = this._enumValues[typeName].typeIdentifier || this._enumValues[typeName].sourceIdentifier;
      } else {
        typeValue = `${prefix}${this._convertName(baseType, {
          useTypesPrefix: this._enumNames.includes(typeName) ? this._enumPrefix : true,
        })}`;
      }
    }

    const fieldName = this.getName(variable);
    const fieldType = this.wrapAstTypeWithModifiers(typeValue, variable.type, this._applyCoercion);

    const hasDefaultValue = variable.defaultValue != null && typeof variable.defaultValue !== 'undefined';
    const isNonNullType = variable.type.kind === Kind.NON_NULL_TYPE;

    const formattedFieldString = this.formatFieldString(fieldName, isNonNullType, hasDefaultValue);
    const formattedTypeString = this.formatTypeString(fieldType, isNonNullType, hasDefaultValue);

    return `${formattedFieldString}: ${formattedTypeString}`;
  }

  public wrapAstTypeWithModifiers(_baseType: string, _typeNode: TypeNode, _applyCoercion?: Boolean): string {
    throw new Error(`You must override "wrapAstTypeWithModifiers" of OperationVariablesToObject!`);
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, _hasDefaultValue: boolean): string {
    return fieldName;
  }

  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';

    if (hasDefaultValue) {
      return `${prefix}Maybe<${fieldType}>`;
    }

    return fieldType;
  }

  protected getPunctuation(): string {
    return ',';
  }
}
