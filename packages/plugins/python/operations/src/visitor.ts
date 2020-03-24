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
} from '@graphql-codegen/visitor-plugin-common';
import { getBaseType } from '@graphql-codegen/plugin-helpers';
import { PythonOperationVariablesToObject } from './ts-operation-variables-to-object';
import { PythonDocumentsPluginConfig } from './config';

import { TypeScriptSelectionSetProcessor } from './ts-selection-set-processor';
import autoBind from 'auto-bind';

export interface PythonDocumentsParsedConfig extends ParsedDocumentsConfig {
  immutableTypes: boolean;
}

export class PythonDocumentsVisitor extends BaseVisitor<PythonDocumentsPluginConfig, PythonDocumentsParsedConfig> {
  private schema: GraphQLSchema;

  constructor(schema: GraphQLSchema, config: PythonDocumentsPluginConfig, allFragments: LoadedFragment[]) {
    super(config, {
      immutableTypes: getConfigValue(config.immutableTypes, false),
    } as PythonDocumentsParsedConfig);

    this.schema = schema;

    autoBind(this);

    const wrapOptional = (type: string) => {
      return `Optional[${type}]`;
    };

    const wrapArray = (type: string) => {
      return `List[${type}]`;
    };

    const formatNamedField = (name: string, type: GraphQLOutputType | null): string => {
      return name;
    };

    const processorConfig: SelectionSetProcessorConfig = {
      namespacedImportName: this.config.namespacedImportName,
      convertName: this.convertName.bind(this),
      enumPrefix: this.config.enumPrefix,
      scalars: this.scalars,
      formatNamedField,
      wrapTypeWithModifiers(baseType, type) {
        return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
      },
    };
    // const processor = new (config.preResolveTypes ? PreResolveTypesProcessor : TypeScriptSelectionSetProcessor)(
    //   processorConfig
    // );
    // this.setSelectionSetHandler(
    //   new SelectionSetToObject(
    //     processor,
    //     this.scalars,
    //     this.schema,
    //     this.convertName.bind(this),
    //     this.getFragmentSuffix.bind(this),
    //     allFragments,
    //     this.config
    //   )
    // );
    // const enumsNames = Object.keys(schema.getTypeMap()).filter(typeName => isEnumType(schema.getType(typeName)));
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

    const result = this.convertSelectionSet(rootType, node.name.value, node.selectionSet);

    const variablesDeclaration = `class ${node.name.value}Variables(BaseModel):`;
    const variablesBody = node.variableDefinitions.map(this.convertVariableDefinition).filter(Boolean).join(`\n`);

    return (variablesBody ? `${variablesDeclaration}\n${indent(variablesBody)}\n\n` : '') + `${result}`;
  }

  FragmentDefinition(node: FragmentDefinitionNode): string {
    const fragmentRootType = this.schema.getType(node.typeCondition.name.value) as GraphQLObjectType;

    return this.convertSelectionSet(fragmentRootType, `${node.name.value}Fragment`, node.selectionSet);
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
      return `${resultDeclaration}\n${indent(things.join(`\n`))}`;
    } else {
      return `${resultDeclaration}\n${indent('pass')}`;
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
        return `${name}: ${fieldType.name}`;
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
    const t = this.schema.getTypeMap()[name];

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
    if (isNonNullType(node.type)) {
      temp += ' = None';
    }
    return temp;
  }
}
