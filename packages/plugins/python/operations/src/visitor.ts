import {
  GraphQLSchema,
  GraphQLOutputType,
  isEnumType,
  isNonNullType,
  isListType,
  isScalarType,
  GraphQLScalarType,
  GraphQLObjectType,
  ObjectTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  VariableDefinitionNode,
  SelectionNode,
  SelectionSetNode,
  TypeNode,
  NamedTypeNode,
  ListTypeNode,
  isLeafType,
  isCompositeType,
  GraphQLEnumType,
  GraphQLLeafType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLCompositeType,
  GraphQLUnionType,
  GraphQLInterfaceType,
  GraphQLType,
  isObjectType,
} from 'graphql';
import {
  wrapTypeWithModifiers,
  PreResolveTypesProcessor,
  BaseDocumentsVisitor,
  ParsedDocumentsConfig,
  BaseVisitor,
  LoadedFragment,
  getConfigValue,
  SelectionSetProcessorConfig,
  SelectionSetToObject,
  DeclarationKind,
  indent,
  indentMultiline,
} from '@graphql-codegen/visitor-plugin-common';
import { getBaseType } from '@graphql-codegen/plugin-helpers';
import { PythonOperationVariablesToObject } from './operation-variables-to-object';
import { PythonDocumentsPluginConfig } from './config';
import { PythonSelectionSetToObject } from './selection-set-to-object';

import { PythonSelectionSetProcessor } from './selection-set-processor';
import autoBind from 'auto-bind';

export interface PythonDocumentsParsedConfig extends ParsedDocumentsConfig {
  immutableTypes: boolean;
}

type TypePayload =
  | {
      kind: 'leaf';
      name: string;
      value: string;
    }
  | {
      kind: 'internal';
      name: string;
      fields: Record<string, TypePayload>;
    };

type SelectionThatDoesNotRequireFields =
  | GraphQLLeafType
  | GraphQLList<SelectionThatDoesNotRequireFields>
  | GraphQLNonNull<SelectionThatDoesNotRequireFields>;

function isSelectionThatDoesNotRequireFields(t: GraphQLOutputType): t is SelectionThatDoesNotRequireFields {
  if (isLeafType(t)) {
    return true;
  } else if (isNonNullType(t)) {
    return isSelectionThatDoesNotRequireFields(t.ofType);
  } else if (isListType(t)) {
    return isSelectionThatDoesNotRequireFields(t.ofType);
  } else {
    return false;
  }
}

type SelectionThatRequiresFields =
  | GraphQLCompositeType
  | GraphQLList<SelectionThatRequiresFields>
  | GraphQLNonNull<SelectionThatRequiresFields>;

function isSelectionThatRequiresFields(t: GraphQLOutputType): t is SelectionThatRequiresFields {
  if (isCompositeType(t)) {
    return true;
  } else if (isNonNullType(t)) {
    return isSelectionThatRequiresFields(t.ofType);
  } else if (isListType(t)) {
    return isSelectionThatRequiresFields(t.ofType);
  } else {
    return false;
  }
}

function unwrapNullsAndLists(
  t: GraphQLOutputType
): GraphQLScalarType | GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | GraphQLEnumType {
  if (isNonNullType(t)) {
    return unwrapNullsAndLists(t.ofType);
  } else if (isListType(t)) {
    return unwrapNullsAndLists(t.ofType);
  } else {
    return t;
  }
}

type ListOrNonNull<T extends GraphQLType> = T | GraphQLList<ListOrNonNull<T>> | GraphQLNonNull<ListOrNonNull<T>>;

interface FieldDeclaration {
  kind: 'field';
  name: string;
  type: ListOrNonNull<GraphQLLeafType>;
}

function isFieldDeclaration(v: AnyDeclaration): v is FieldDeclaration {
  return v.kind === 'field';
}

interface FragmentDeclaration {
  kind: 'fragment';
  name: string;
}

function isFragmentDeclaration(v: AnyDeclaration): v is FragmentDeclaration {
  return v.kind === 'fragment';
}

interface ObjectDeclaration {
  kind: 'object';
  name: string;
  type: ListOrNonNull<GraphQLCompositeType>;
  selection: AnyDeclaration[];
}

function isObjectDeclaration(v: AnyDeclaration): v is ObjectDeclaration {
  return v.kind === 'object';
}

type AnyDeclaration = FieldDeclaration | ObjectDeclaration | FragmentDeclaration;

interface Declaration {
  className?: string;
  type: GraphQLObjectType;
  selection: AnyDeclaration[];
}

function parse(parentType: GraphQLObjectType, selectionSet: SelectionSetNode): Declaration {
  function helper(parentType: GraphQLObjectType, selectionSet: SelectionSetNode): AnyDeclaration[] {
    return selectionSet.selections
      .map(
        (s): AnyDeclaration => {
          if (s.kind === 'Field') {
            const type = parentType.getFields()[s.name.value]!.type;
            const name = s.alias?.value ?? s.name.value;
            if (type == null) {
              throw new Error('type was null');
            } else if (s.selectionSet) {
              if (!isSelectionThatRequiresFields(type)) {
                throw new Error('also wrong type');
              }
              const unwrappedType = unwrapNullsAndLists(type);
              if (!isObjectType(unwrappedType)) {
                throw new Error('should be object type');
              }
              return {
                kind: 'object',
                name,
                type,
                selection: helper(unwrappedType, s.selectionSet),
              };
            } else {
              if (!isSelectionThatDoesNotRequireFields(type)) {
                throw new Error('wrong type');
              }
              return {
                kind: 'field',
                name,
                type,
              };
            }
          } else if (s.kind === 'FragmentSpread') {
            return {
              kind: 'fragment',
              name: s.name.value,
            };
          } else {
            return null;
          }
        }
      )
      .filter(Boolean);
  }

  return {
    type: parentType,
    selection: helper(parentType, selectionSet),
  };
}

const PYTHON_SCALAR_CONVERSIONS = {
  ID: 'str',
  String: 'str',
  Boolean: 'bool',
  Int: 'int',
  Float: 'float',
};

function print(declaration: Declaration) {
  const header = `class ${declaration.className ?? declaration.type.name}(BaseModel):`;

  // TODO: Is this function actually right?
  function printTypeName(t: GraphQLOutputType) {
    const UNWRAP_OPTIONAL_REGEX = /^Optional\[(.*)\]$/;

    if (isNonNullType(t)) {
      const delegate = printTypeName(t.ofType);
      const match = UNWRAP_OPTIONAL_REGEX.exec(delegate);
      return match?.[1] ?? delegate;
    } else if (isListType(t)) {
      return `List[${printTypeName(t.ofType)}]`;
    } else {
      return `Optional[${PYTHON_SCALAR_CONVERSIONS[t.name] || t.name}]`;
    }
  }

  function formatSelectionBody(type: ListOrNonNull<GraphQLCompositeType>, selection: AnyDeclaration[]): string[] {
    const innerClasses = selection.filter(isObjectDeclaration);
    // TODO: Type-safely pick out the fields that need to be printed.
    return [
      ...innerClasses.flatMap((o) => [...formatObject(o), '']),
      ...selection.filter((o) => 'type' in o).map((o) => `${o.name}: ${printTypeName((o as any).type)}`),
    ].filter((l) => l != null);
  }

  function formatObject(o: ObjectDeclaration): string[] {
    const lines = formatSelectionBody(o.type, o.selection);
    const fragments = o.selection.filter(isFragmentDeclaration);
    const parentClasses = fragments.length > 0 ? fragments.map(({ name }) => name).join(', ') : 'BaseModel';
    const header = `class ${unwrapNullsAndLists(o.type).name}(${parentClasses}):`;
    if (lines.length) {
      return [header, ...lines.map((l) => indent(l))];
    } else {
      return [header, indent('pass')];
    }
  }

  function formatField(f: FieldDeclaration): string[] {
    return [`${f.name}: ${printTypeName(f.type)}`];
  }

  const bodyLines = formatSelectionBody(declaration.type, declaration.selection);

  return `${header}\n${indentMultiline(bodyLines.join('\n'))}\n`;
}

export class PythonDocumentsVisitor extends BaseVisitor<PythonDocumentsPluginConfig, PythonDocumentsParsedConfig> {
  private schema: GraphQLSchema;

  constructor(schema: GraphQLSchema, config: PythonDocumentsPluginConfig, allFragments: LoadedFragment[]) {
    super(
      config,
      {
        immutableTypes: getConfigValue(config.immutableTypes, false),
      } as PythonDocumentsParsedConfig
      // schema
    );

    this.schema = schema;

    autoBind(this);

    // const wrapOptional = (type: string) => {
    //   return `Optional[${type}]`;
    // };
    //
    // const wrapArray = (type: string) => {
    //   return `List[${type}]`;
    // };
    //
    // const formatNamedField = (name: string, type: GraphQLOutputType | null): string => {
    //   return name;
    // };
    //
    // const processorConfig: SelectionSetProcessorConfig = {
    //   namespacedImportName: this.config.namespacedImportName,
    //   convertName: this.convertName.bind(this),
    //   enumPrefix: this.config.enumPrefix,
    //   scalars: this.scalars,
    //   formatNamedField,
    //   wrapTypeWithModifiers(baseType, type) {
    //     return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
    //   },
    // };
    // const processor = new (config.preResolveTypes ? PreResolveTypesProcessor : PythonSelectionSetProcessor)(
    //   processorConfig
    // );
    // this.setSelectionSetHandler(
    //   new PythonSelectionSetToObject(
    //     processor,
    //     this.scalars,
    //     this.schema,
    //     this.convertName.bind(this),
    //     this.getFragmentSuffix.bind(this),
    //     allFragments,
    //     this.config
    //   )
    // );
    // const enumsNames = Object.keys(schema.getTypeMap()).filter((typeName) => isEnumType(schema.getType(typeName)));
    // this.setVariablesTransformer(
    //   new PythonOperationVariablesToObject(
    //     this.scalars,
    //     this.convertName.bind(this),
    //     this.config.immutableTypes,
    //     this.config.namespacedImportName,
    //     enumsNames,
    //     this.config.enumPrefix,
    //     this.config.enumValues
    //   )
    // );
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    return 'input object ' + node.kind;
    // return node.fields.map(f => f.name.value).join('\n');
    // const name = `${this.convertName(node)}Input`;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    return 'object ' + node.kind;
    // return node.fields.map(f => f.name.value).join('\n');
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    let rootType;
    if (node.operation === 'query') {
      rootType = this.schema.getQueryType();
    } else if (node.operation === 'mutation') {
      rootType = this.schema.getMutationType();
    } else if (node.operation === 'subscription') {
      rootType = this.schema.getSubscriptionType();
    } else {
      // assertNever
    }

    const declaration = parse(rootType, node.selectionSet);
    declaration.className = node.name.value;
    return print(declaration);

    // const result = this.convertSelectionSet(rootType, node.name.value, node.selectionSet);

    // const variablesDeclaration = `class ${node.name.value}Variables(BaseModel):`;
    // const variablesBody = node.variableDefinitions.map(this.convertVariableDefinition).filter(Boolean).join(`\n`);

    // return (variablesBody ? `${variablesDeclaration}\n${indentMultiline(variablesBody)}\n\n` : '') + `${result}`;
  }

  FragmentDefinition(node: FragmentDefinitionNode): string {
    const fragmentRootType = this.schema.getType(node.typeCondition.name.value) as GraphQLObjectType;
    const declaration = parse(fragmentRootType, node.selectionSet);
    declaration.className = `${node.name.value}Fragment`;
    return print(declaration);
  }

  convertSelectionSet(
    rootType: GraphQLObjectType,
    name: string,
    node: SelectionSetNode,
    parentClass = 'BaseModel'
  ): string {
    const resultDeclaration = `class ${name}(${parentClass}):`;

    const things = node.selections.map((s) => this.convertSelection(rootType, name, s)).filter(Boolean);

    if (things.length > 0) {
      return `${resultDeclaration}\n${indentMultiline(things.join(`\n`))}`;
    } else {
      return `${resultDeclaration}\n${indentMultiline('pass')}`;
    }
  }

  convertSelection(parentType: GraphQLObjectType, parentName: string, node: SelectionNode): string {
    if (node.kind === 'Field') {
      const name = node.alias?.value ?? node.name.value;
      const fieldType = parentType.getFields()[node.name.value];
      if (node.selectionSet) {
        const nestedName = `${parentName}_${name}`;
        // TODO: This cast is probably illegal.
        const s = this.convertSelectionSet(
          getBaseType(fieldType.type) as GraphQLObjectType,
          nestedName,
          node.selectionSet
        );
        return `${s}\n\n${name}: ${nestedName}`;
      } else {
        const t = fieldType.type;
        let type;
        if (isNonNullType(t)) {
        } else if (isScalarType(t)) {
          type = this.convertNamedType(t.name);
        } else if (isEnumType(t)) {
          type = t.name;
        } else if (isListType(t)) {
          type = `List[${this.convertNamedType(t.ofType)}]`;
        } else {
          throw new Error('what is it?!');
        }
        return 'something';
        // return `${name}: ${fieldType.type} ${}`;
      }
    } else if (node.kind === 'FragmentSpread') {
      const nestedName = `${parentName}_${node.name.value}`;
      return 'hello ' + this.schema.getType(node.kind)?.name ?? 'dunno';
      // return 'hello' + this.schema.getTypeMap()[node.kind].name;
      // node.name
    } else {
      return node.kind;
    }
  }

  convertNamedType(name: string): string {
    const t = this.schema.getType(name);

    if (!t) {
      throw new Error('dunno');
    }

    const PYTHON_SCALAR_CONVERSIONS = {
      String: 'str',
      Boolean: 'bool',
      Int: 'int',
      Float: 'float',
    };

    if (t.name in PYTHON_SCALAR_CONVERSIONS) {
      return PYTHON_SCALAR_CONVERSIONS[t.name];
    } else {
      return t.name;
    }
  }

  convertType(node: TypeNode): string {
    if (node.kind === 'NonNullType') {
      return this.convertNonNullType(node.type);
    } else if (node.kind === 'ListType') {
      return `Optional[List[${this.convertType(node.type)}]]`;
    } else if (node.kind === 'NamedType') {
      return `Optional[${this.convertNamedType(node.name.value)}]`;
    } else {
      // assertNever
      return '';
    }
  }

  convertNonNullType(node: ListTypeNode | NamedTypeNode): string {
    if (node.kind === 'ListType') {
      return `List[${this.convertType(node.type)}]`;
    } else if (node.kind === 'NamedType') {
      return this.convertNamedType(node.name.value);
    } else {
      // assertNever
      return '';
    }
  }

  convertVariableDefinition(node: VariableDefinitionNode): string {
    let temp = `${node.variable.name.value}: ${this.convertType(node.type)}`;
    if (!isNonNullType(node.type)) {
      temp += ' = None';
    }
    return temp;
  }
}
