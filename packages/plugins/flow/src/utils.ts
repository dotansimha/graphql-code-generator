import { pascalCase } from 'change-case';
import {
  NameNode,
  Kind,
  TypeNode,
  NamedTypeNode,
  isNonNullType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  isListType
} from 'graphql';
import { OutputOptions } from './index';

export function block(array) {
  return array && array.length !== 0 ? '{\n' + array.join('\n') + '\n}' : '';
}

export function wrapWithSingleQuotes(str: string | NameNode): string {
  return `'${str}'`;
}

export function breakLine(str: string): string {
  return str + '\n';
}

export function indent(str: string): string {
  return '  ' + str;
}

export class DeclarationBlock {
  _export = false;
  _name = null;
  _kind = null;
  _methodName = null;
  _content = null;
  _block = null;
  _nameGenerics = null;
  _outputOptions = null;

  constructor(outputOptions: OutputOptions) {
    this._outputOptions = outputOptions;
  }

  export(exp = true): DeclarationBlock {
    this._export = exp;

    return this;
  }

  asKind(kind): DeclarationBlock {
    this._kind = kind;

    return this;
  }

  withMethodCall(methodName: string): DeclarationBlock {
    this._methodName = methodName;

    return this;
  }

  withBlock(block: string): DeclarationBlock {
    this._block = block;

    return this;
  }

  withContent(content: string): DeclarationBlock {
    this._content = content;

    return this;
  }

  withName(name: string | NameNode, generics: string | null = null): DeclarationBlock {
    this._name = name;
    this._nameGenerics = generics;

    return this;
  }

  getFlowReadOnlyTypeBlock(): string {
    return (
      (this._block &&
        this._block
          .split('\n')
          .map((item: string): string => `${' '.repeat(item.search(/\S|$/))}+${item.substr(item.search(/\S|$/))}`)
          .join('\n')) ||
      ''
    );
  }

  public get string(): string {
    const useFlowExactObject: boolean = this._outputOptions.indexOf('useFlowExactObjects') > -1;
    const useFlowReadOnlyTypes: boolean = this._outputOptions.indexOf('useFlowReadOnlyTypes') > -1;
    const block: string = this._block && useFlowReadOnlyTypes ? this.getFlowReadOnlyTypeBlock() : this._block;
    let result = '';

    if (this._export) {
      result += 'export ';
    }

    if (this._kind) {
      let extra = '';
      let name = '';

      if (['type', 'const', 'var', 'let'].includes(this._kind)) {
        extra = '= ';
      }

      if (this._name) {
        name = this._name + (this._nameGenerics || '') + ' ';
      }

      result += this._kind + ' ' + name + extra;
    }

    if (block) {
      if (this._content) {
        result += this._content;
      }

      if (this._methodName) {
        result += `${this._methodName}({
${block}
})`;
      } else {
        result += `{${useFlowExactObject ? '|' : ''}
${block}
${useFlowExactObject ? '|' : ''}}`;
      }
    } else if (this._content) {
      result += this._content;
    } else if (this._kind) {
      result += '{}';
    }

    return result + (this._kind === 'interface' ? '' : ';') + '\n';
  }
}

export function getBaseTypeNode(typeNode: TypeNode): NamedTypeNode {
  if (typeNode.kind === Kind.LIST_TYPE || typeNode.kind === Kind.NON_NULL_TYPE) {
    return getBaseTypeNode(typeNode.type);
  }

  return typeNode;
}

export function wrapAstTypeWithModifiers(baseType: string, typeNode: TypeNode): string {
  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    return wrapAstTypeWithModifiers(baseType, typeNode.type).substr(1);
  } else if (typeNode.kind === Kind.LIST_TYPE) {
    const innerType = wrapAstTypeWithModifiers(baseType, typeNode.type);

    return `?Array<${innerType}>`;
  } else {
    return `?${baseType}`;
  }
}

export function wrapTypeWithModifiers(
  baseType: string,
  type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>
): string {
  if (isNonNullType(type)) {
    return wrapTypeWithModifiers(baseType, type.ofType).substr(1);
  } else if (isListType(type)) {
    const innerType = wrapTypeWithModifiers(baseType, type.ofType);

    return `?Array<${innerType}>`;
  } else {
    return `?${baseType}`;
  }
}

export function toPascalCase(str: string) {
  return str
    .split('_')
    .map(s => pascalCase(s))
    .join('_');
}
