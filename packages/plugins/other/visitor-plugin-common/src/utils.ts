import {
  NameNode,
  Kind,
  TypeNode,
  NamedTypeNode,
  GraphQLObjectType,
  GraphQLNamedType,
  isScalarType,
  GraphQLSchema,
  GraphQLScalarType,
  StringValueNode,
  isEqualType,
  SelectionSetNode,
  FieldNode,
  SelectionNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  isNonNullType,
  isObjectType,
  isListType,
  isAbstractType,
  GraphQLOutputType,
} from 'graphql';
import { ScalarsMap, NormalizedScalarsMap, ParsedScalarsMap } from './types';
import { DEFAULT_SCALARS } from './scalars';
import { parseMapper } from './mappers';
import { RawConfig } from './base-visitor';

export const getConfigValue = <T = any>(value: T, defaultValue: T): T => {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  return value;
};

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

export function wrapWithSingleQuotes(value: string | number | NameNode, skipNumericCheck = false): string {
  if (skipNumericCheck) {
    if (typeof value === 'number') {
      return `${value}`;
    } else {
      return `'${value}'`;
    }
  }

  if (
    typeof value === 'number' ||
    (typeof value === 'string' && !isNaN(parseInt(value)) && parseFloat(value).toString() === value)
  ) {
    return `${value}`;
  }

  return `'${value}'`;
}

export function breakLine(str: string): string {
  return str + '\n';
}

export function indent(str: string, count = 1): string {
  return new Array(count).fill('  ').join('') + str;
}

export function indentMultiline(str: string, count = 1): string {
  const indentation = new Array(count).fill('  ').join('');
  const replaceWith = '\n' + indentation;

  return indentation + str.replace(/\n/g, replaceWith);
}

export interface DeclarationBlockConfig {
  blockWrapper?: string;
  blockTransformer?: (block: string) => string;
  enumNameValueSeparator?: string;
  ignoreExport?: boolean;
}

export function transformComment(comment: string | StringValueNode, indentLevel = 0, disabled = false): string {
  if (!comment || comment === '' || disabled) {
    return '';
  }

  if (isStringValueNode(comment)) {
    comment = comment.value;
  }

  comment = comment.split('*/').join('*\\/');
  let lines = comment.split('\n');
  if (lines.length === 1) {
    return indent(`/** ${lines[0]} */\n`, indentLevel);
  }
  lines = ['/**', ...lines.map(line => ` * ${line}`), ' */\n'];
  return stripTrailingSpaces(lines.map(line => indent(line, indentLevel)).join('\n'));
}

export class DeclarationBlock {
  _decorator = null;
  _export = false;
  _name = null;
  _kind = null;
  _methodName = null;
  _content = null;
  _block = null;
  _nameGenerics = null;
  _comment = null;
  _ignoreBlockWrapper = false;

  constructor(private _config: DeclarationBlockConfig) {
    this._config = {
      blockWrapper: '',
      blockTransformer: block => block,
      enumNameValueSeparator: ':',
      ...this._config,
    };
  }

  withDecorator(decorator: string): DeclarationBlock {
    this._decorator = decorator;

    return this;
  }

  export(exp = true): DeclarationBlock {
    if (!this._config.ignoreExport) {
      this._export = exp;
    }

    return this;
  }

  asKind(kind: string): DeclarationBlock {
    this._kind = kind;

    return this;
  }

  withComment(comment: string | StringValueNode | null, disabled = false): DeclarationBlock {
    const nonEmptyComment = isStringValueNode(comment) ? !!comment.value : !!comment;

    if (nonEmptyComment && !disabled) {
      this._comment = transformComment(comment, 0);
    }

    return this;
  }

  withMethodCall(methodName: string, ignoreBlockWrapper = false): DeclarationBlock {
    this._methodName = methodName;
    this._ignoreBlockWrapper = ignoreBlockWrapper;

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

    if (this._decorator) {
      result += this._decorator + '\n';
    }

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

      const blockWrapper = this._ignoreBlockWrapper ? '' : this._config.blockWrapper;
      const before = '{' + blockWrapper;
      const after = blockWrapper + '}';
      const block = [before, this._block, after].filter(val => !!val).join('\n');

      if (this._methodName) {
        result += `${this._methodName}(${this._config.blockTransformer(block)})`;
      } else {
        result += this._config.blockTransformer(block);
      }
    } else if (this._content) {
      result += this._content;
    } else if (this._kind) {
      result += this._config.blockTransformer('{}');
    }

    return stripTrailingSpaces(
      (this._comment ? this._comment : '') +
        result +
        (this._kind === 'interface' || this._kind === 'enum' || this._kind === 'namespace' || this._kind === 'function'
          ? ''
          : ';') +
        '\n'
    );
  }
}

export function getBaseTypeNode(typeNode: TypeNode): NamedTypeNode {
  if (typeNode.kind === Kind.LIST_TYPE || typeNode.kind === Kind.NON_NULL_TYPE) {
    return getBaseTypeNode(typeNode.type);
  }

  return typeNode;
}

export function convertNameParts(str: string, func: (str: string) => string, removeUnderscore = false): string {
  if (removeUnderscore) {
    return func(str);
  }

  return str
    .split('_')
    .map(s => func(s))
    .join('_');
}

export function buildScalarsFromConfig(
  schema: GraphQLSchema | undefined,
  config: RawConfig,
  defaultScalarsMapping: NormalizedScalarsMap = DEFAULT_SCALARS,
  defaultScalarType = 'any'
): ParsedScalarsMap {
  return buildScalars(
    schema,
    config.scalars,
    defaultScalarsMapping,
    config.strictScalars ? null : config.defaultScalarType || defaultScalarType
  );
}

export function buildScalars(
  schema: GraphQLSchema | undefined,
  scalarsMapping: ScalarsMap,
  defaultScalarsMapping: NormalizedScalarsMap = DEFAULT_SCALARS,
  defaultScalarType: string | null = 'any'
): ParsedScalarsMap {
  const result: ParsedScalarsMap = {};

  Object.keys(defaultScalarsMapping).forEach(name => {
    result[name] = parseMapper(defaultScalarsMapping[name]);
  });

  if (schema) {
    const typeMap = schema.getTypeMap();

    Object.keys(typeMap)
      .map(typeName => typeMap[typeName])
      .filter(type => isScalarType(type))
      .map((scalarType: GraphQLScalarType) => {
        const name = scalarType.name;
        if (typeof scalarsMapping === 'string') {
          const value = parseMapper(scalarsMapping + '#' + name, name);
          result[name] = value;
        } else if (scalarsMapping && typeof scalarsMapping[name] === 'string') {
          const value = parseMapper(scalarsMapping[name], name);
          result[name] = value;
        } else if (scalarsMapping && scalarsMapping[name]) {
          result[name] = {
            isExternal: false,
            type: JSON.stringify(scalarsMapping[name]),
          };
        } else if (!defaultScalarsMapping[name]) {
          if (defaultScalarType === null) {
            throw new Error(`Unknown scalar type ${name}. Please override it using the "scalars" configuration field!`);
          }
          result[name] = {
            isExternal: false,
            type: defaultScalarType,
          };
        }
      });
  } else if (scalarsMapping) {
    if (typeof scalarsMapping === 'string') {
      throw new Error('Cannot use string scalars mapping when building without a schema');
    }
    Object.keys(scalarsMapping).forEach(name => {
      if (typeof scalarsMapping[name] === 'string') {
        const value = parseMapper(scalarsMapping[name], name);
        result[name] = value;
      } else {
        result[name] = {
          isExternal: false,
          type: JSON.stringify(scalarsMapping[name]),
        };
      }
    });
  }

  return result;
}

function isStringValueNode(node: any): node is StringValueNode {
  return node && typeof node === 'object' && node.kind === Kind.STRING;
}

export function isRootType(type: GraphQLNamedType, schema: GraphQLSchema): type is GraphQLObjectType {
  return (
    isEqualType(type, schema.getQueryType()) ||
    isEqualType(type, schema.getMutationType()) ||
    isEqualType(type, schema.getSubscriptionType())
  );
}

export function getRootTypeNames(schema: GraphQLSchema): string[] {
  return [schema.getQueryType(), schema.getMutationType(), schema.getSubscriptionType()]
    .filter(t => t)
    .map(t => t.name);
}

export function stripMapperTypeInterpolation(identifier: string): string {
  return identifier.trim().replace(/<{.*}>/, '');
}

export const OMIT_TYPE = 'export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;';
export const REQUIRE_FIELDS_TYPE = `export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };`;

export function mergeSelectionSets(selectionSet1: SelectionSetNode, selectionSet2: SelectionSetNode): void {
  const newSelections = [...selectionSet1.selections];

  for (const selection2 of selectionSet2.selections) {
    if (selection2.kind === 'FragmentSpread') {
      newSelections.push(selection2);
      continue;
    }

    if (selection2.kind !== 'Field') {
      throw new TypeError('Invalid state.');
    }

    const match = newSelections.find(
      selection1 =>
        selection1.kind === 'Field' && getFieldNodeNameValue(selection1) === getFieldNodeNameValue(selection2)
    );

    if (match) {
      // recursively merge all selection sets
      if (match.kind === 'Field' && match.selectionSet && selection2.selectionSet) {
        mergeSelectionSets(match.selectionSet, selection2.selectionSet);
      }
      continue;
    }

    newSelections.push(selection2);
  }

  // replace existing selections
  selectionSet1.selections = newSelections;
}

export const getFieldNodeNameValue = (node: FieldNode): string => {
  return (node.alias || node.name).value;
};

export function separateSelectionSet(
  selections: ReadonlyArray<SelectionNode>
): { fields: FieldNode[]; spreads: FragmentSpreadNode[]; inlines: InlineFragmentNode[] } {
  return {
    fields: selections.filter(s => s.kind === Kind.FIELD) as FieldNode[],
    inlines: selections.filter(s => s.kind === Kind.INLINE_FRAGMENT) as InlineFragmentNode[],
    spreads: selections.filter(s => s.kind === Kind.FRAGMENT_SPREAD) as FragmentSpreadNode[],
  };
}

export function getPossibleTypes(schema: GraphQLSchema, type: GraphQLNamedType): GraphQLObjectType[] {
  if (isListType(type) || isNonNullType(type)) {
    return getPossibleTypes(schema, type.ofType);
  } else if (isObjectType(type)) {
    return [type];
  } else if (isAbstractType(type)) {
    return schema.getPossibleTypes(type) as Array<GraphQLObjectType>;
  }

  return [];
}

export function hasConditionalDirectives(field: FieldNode): boolean {
  const CONDITIONAL_DIRECTIVES = ['skip', 'include'];
  return field.directives?.some(directive => CONDITIONAL_DIRECTIVES.includes(directive.name.value));
}

type WrapModifiersOptions = {
  wrapOptional(type: string): string;
  wrapArray(type: string): string;
};
export function wrapTypeWithModifiers(
  baseType: string,
  type: GraphQLOutputType | GraphQLNamedType,
  options: WrapModifiersOptions
): string {
  let currentType = type;
  const modifiers: Array<(type: string) => string> = [];
  while (currentType) {
    if (isNonNullType(currentType)) {
      currentType = currentType.ofType;
    } else {
      modifiers.push(options.wrapOptional);
    }

    if (isListType(currentType)) {
      modifiers.push(options.wrapArray);
      currentType = currentType.ofType;
    } else {
      break;
    }
  }

  return modifiers.reduceRight((result, modifier) => modifier(result), baseType);
}

export function removeDescription<T extends { description?: StringValueNode }>(nodes: readonly T[]) {
  return nodes.map(node => ({ ...node, description: undefined }));
}

export function wrapTypeNodeWithModifiers(baseType: string, typeNode: TypeNode): string {
  switch (typeNode.kind) {
    case Kind.NAMED_TYPE: {
      return `Maybe<${baseType}>`;
    }
    case Kind.NON_NULL_TYPE: {
      const innerType = wrapTypeNodeWithModifiers(baseType, typeNode.type);
      return clearOptional(innerType);
    }
    case Kind.LIST_TYPE: {
      const innerType = wrapTypeNodeWithModifiers(baseType, typeNode.type);
      return `Maybe<Array<${innerType}>>`;
    }
  }
}

function clearOptional(str: string): string {
  const rgx = new RegExp(`^Maybe<(.*?)>$`, 'i');

  if (str.startsWith(`Maybe`)) {
    return str.replace(rgx, '$1');
  }

  return str;
}

function stripTrailingSpaces(str: string): string {
  return str.replace(/ +\n/g, '\n');
}
