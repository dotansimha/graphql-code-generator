import {
  GraphQLSchema,
  GraphQLOutputType,
  isNonNullType,
  isListType,
  GraphQLScalarType,
  GraphQLObjectType,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  SelectionSetNode,
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
  isInterfaceType,
} from 'graphql';
import {
  ParsedDocumentsConfig,
  BaseVisitor,
  LoadedFragment,
  getConfigValue,
  indent,
  indentMultiline,
} from '@graphql-codegen/visitor-plugin-common';
import { PythonDocumentsPluginConfig } from './config';
import autoBind from 'auto-bind';

export interface PythonDocumentsParsedConfig extends ParsedDocumentsConfig {
  immutableTypes: boolean;
}

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

const PYTHON_SCALAR_CONVERSIONS = {
  ID: 'str',
  String: 'str',
  Boolean: 'bool',
  Int: 'int',
  Float: 'float',
};

function getFragmentName(baseName: string) {
  return `${baseName}Fragment`;
}

export class PythonDocumentsVisitor extends BaseVisitor<PythonDocumentsPluginConfig, PythonDocumentsParsedConfig> {
  constructor(
    private schema: GraphQLSchema,
    config: PythonDocumentsPluginConfig,
    private allFragments: LoadedFragment[]
  ) {
    super(
      config,
      {
        immutableTypes: getConfigValue(config.immutableTypes, false),
      } as PythonDocumentsParsedConfig
      // schema
    );

    autoBind(this);
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

    // TODO: Variables types.
    // TODO: Fragments that are referred to here, but aren't defined here, must be imported!

    const declaration = this.parse(rootType, node.selectionSet);
    declaration.className = node.name.value;
    return this.print(declaration);
  }

  FragmentDefinition(node: FragmentDefinitionNode): string {
    const fragmentRootType = this.schema.getType(node.typeCondition.name.value) as GraphQLObjectType;
    const declaration = this.parse(fragmentRootType, node.selectionSet);
    declaration.className = getFragmentName(node.name.value);
    return this.print(declaration);
  }

  // here be dragons

  parse(parentType: GraphQLObjectType, selectionSet: SelectionSetNode): Declaration {
    function helper(parentType: GraphQLCompositeType, selectionSet: SelectionSetNode): AnyDeclaration[] {
      return selectionSet.selections
        .map(
          (s): AnyDeclaration => {
            if (s.kind === 'Field') {
              if (!isInterfaceType(parentType) && !isObjectType(parentType)) {
                throw new Error(`should be interface/object type, but was ${parentType.name}`);
              }

              const type = parentType.getFields()[s.name.value]!.type;
              const name = s.alias?.value ?? s.name.value;
              if (type == null) {
                throw new Error('type was null');
              } else if (s.selectionSet) {
                if (!isSelectionThatRequiresFields(type)) {
                  throw new Error('also wrong type');
                }
                const unwrappedType = unwrapNullsAndLists(type);
                if (!isCompositeType(unwrappedType)) {
                  throw new Error(`should be composite type, but was ${parentType.name}`);
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

  print(declaration: Declaration) {
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
      const parentClasses =
        fragments.length > 0 ? fragments.map(({ name }) => getFragmentName(name)).join(', ') : 'BaseModel';
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
}
