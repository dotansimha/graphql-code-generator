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
  isListType,
  GraphQLOutputType,
  GraphQLNamedType
} from 'graphql';

function isWrapperType(t: GraphQLOutputType): t is GraphQLNonNull<any> | GraphQLList<any> {
  return isListType(t) || isNonNullType(t);
}

export const getConfigValue = <T = any>(value: T, defaultValue: T): T => {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  return value;
};

export function getBaseType(type: GraphQLOutputType): GraphQLNamedType {
  if (isWrapperType(type)) {
    return getBaseType(type.ofType);
  } else {
    return type;
  }
}

export function quoteIfNeeded(array: string[], joinWith = ' & '): string {
  if (array.length === 0) {
    return '';
  } else if (array.length === 1) {
    return array[0];
  } else {
    return `(${array.join(joinWith)})`;
  }
}

export function block(array) {
  return array && array.length !== 0 ? '{\n' + array.join('\n') + '\n}' : '';
}

export function wrapWithSingleQuotes(str: string | NameNode): string {
  return `'${str}'`;
}

export function breakLine(str: string): string {
  return str + '\n';
}

export function indent(str: string, count = 1): string {
  return new Array(count).fill('  ').join('') + str;
}

export interface DeclarationBlockConfig {
  blockWrapper?: string;
  enumNameValueSeparator?: string;
}

export class DeclarationBlock {
  _export = false;
  _name = null;
  _kind = null;
  _methodName = null;
  _content = null;
  _block = null;
  _nameGenerics = null;

  constructor(private _config: DeclarationBlockConfig) {
    this._config = {
      blockWrapper: '',
      enumNameValueSeparator: ':',
      ...this._config
    };
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

  public get string(): string {
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

    if (this._block) {
      if (this._content) {
        result += this._content;
      }

      if (this._methodName) {
        result += `${this._methodName}({${this._config.blockWrapper}
${this._block}
${this._config.blockWrapper}})`;
      } else {
        result += `{${this._config.blockWrapper}
${this._block}
${this._config.blockWrapper}}`;
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

export function toPascalCase(str: string) {
  return str
    .split('_')
    .map(s => pascalCase(s))
    .join('_');
}

export const wrapTypeWithModifiers = (prefix = '') => (
  baseType: string,
  type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>
): string => {
  if (isNonNullType(type)) {
    return wrapTypeWithModifiers(prefix)(baseType, type.ofType).substr(1);
  } else if (isListType(type)) {
    const innerType = wrapTypeWithModifiers(prefix)(baseType, type.ofType);

    return `${prefix}Array<${innerType}>`;
  } else {
    return `${prefix}${baseType}`;
  }
};
