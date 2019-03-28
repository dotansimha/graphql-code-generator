import { pascalCase } from 'change-case';
import { NameNode, Kind, TypeNode, NamedTypeNode, isNonNullType, GraphQLObjectType, GraphQLNonNull, GraphQLList, isListType, GraphQLOutputType, GraphQLNamedType, isScalarType, GraphQLSchema, GraphQLScalarType, StringValueNode } from 'graphql';
import { ScalarsMap } from './types';

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
  blockTransformer?: (block: string) => string;
  enumNameValueSeparator?: string;
}

export function transformComment(comment: string | StringValueNode, indentLevel = 0): string {
  if (!comment || comment === '') {
    return '';
  }

  if (isStringValueNode(comment)) {
    comment = comment.value;
  }

  const lines = comment.split('\n');

  return lines
    .map((line, index) => {
      const isLast = lines.length === index + 1;
      const isFirst = index === 0;

      if (isFirst && isLast) {
        return indent(`/** ${comment} */\n`, indentLevel);
      }

      return indent(`${isFirst ? '/** ' : ' * '}${line}${isLast ? '\n */\n' : ''}`, indentLevel);
    })
    .join('\n');
}

export class DeclarationBlock {
  _export = false;
  _name = null;
  _kind = null;
  _methodName = null;
  _content = null;
  _block = null;
  _nameGenerics = null;
  _comment = null;

  constructor(private _config: DeclarationBlockConfig) {
    this._config = {
      blockWrapper: '',
      blockTransformer: block => block,
      enumNameValueSeparator: ':',
      ...this._config,
    };
  }

  export(exp = true): DeclarationBlock {
    this._export = exp;

    return this;
  }

  asKind(kind: string): DeclarationBlock {
    this._kind = kind;

    return this;
  }

  withComment(comment: string | StringValueNode | null): DeclarationBlock {
    if (comment) {
      this._comment = transformComment(comment, 0);
    }

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

      const before = '{' + this._config.blockWrapper;
      const after = this._config.blockWrapper + '}';
      const block = [before, this._block, after].join('\n');

      if (this._methodName) {
        result += `${this._methodName}(${this._config.blockTransformer!(block)})`;
      } else {
        result += this._config.blockTransformer!(block);
      }
    } else if (this._content) {
      result += this._content;
    } else if (this._kind) {
      result += '{}';
    }

    return (this._comment ? this._comment : '') + result + (this._kind === 'interface' || this._kind === 'enum' ? '' : ';') + '\n';
  }
}

export function getBaseTypeNode(typeNode: TypeNode): NamedTypeNode {
  if (typeNode.kind === Kind.LIST_TYPE || typeNode.kind === Kind.NON_NULL_TYPE) {
    return getBaseTypeNode(typeNode.type);
  }

  return typeNode;
}

export function convertNameParts(str: string, func: (str: string) => string, transformUnderscore = false): string {
  if (transformUnderscore) {
    return func(str);
  }

  return str
    .split('_')
    .map(s => func(s))
    .join('_');
}

export function toPascalCase(str: string, transformUnderscore = false): string {
  return convertNameParts(str, pascalCase, transformUnderscore);
}

export const wrapTypeWithModifiers = (prefix = '') => (baseType: string, type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>): string => {
  if (isNonNullType(type)) {
    return wrapTypeWithModifiers(prefix)(baseType, type.ofType).substr(1);
  } else if (isListType(type)) {
    const innerType = wrapTypeWithModifiers(prefix)(baseType, type.ofType);

    return `${prefix}Array<${innerType}>`;
  } else {
    return `${prefix}${baseType}`;
  }
};

export function buildScalars(schema: GraphQLSchema, scalarsMapping: ScalarsMap): ScalarsMap {
  const typeMap = schema.getTypeMap();
  let result = { ...scalarsMapping };

  Object.keys(typeMap)
    .map(typeName => typeMap[typeName])
    .filter(type => isScalarType(type))
    .map((scalarType: GraphQLScalarType) => {
      const name = scalarType.name;
      const value = scalarsMapping[name] || 'any';

      result[name] = value;
    });

  return result;
}

function isStringValueNode(node: any): node is StringValueNode {
  return node && typeof node === 'object' && node.kind === 'StringValue';
}
