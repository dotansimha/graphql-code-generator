import {
  GraphQLSchema,
  GraphQLOutputType,
  isEnumType,
  isNonNullType,
  isListType,
  isScalarType,
  GraphQLScalarType,
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
} from '@graphql-codegen/visitor-plugin-common';
import { PythonOperationVariablesToObject } from './ts-operation-variables-to-object';
import { PythonDocumentsPluginConfig } from './config';

import { TypeScriptSelectionSetProcessor } from './ts-selection-set-processor';
import autoBind from 'auto-bind';

export interface PythonDocumentsParsedConfig extends ParsedDocumentsConfig {
  immutableTypes: boolean;
}

export class PythonDocumentsVisitor extends BaseVisitor<PythonDocumentsPluginConfig, PythonDocumentsParsedConfig> {
  private indent = '    ';
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
    return node.kind;
    // return node.fields.map(f => f.name.value).join('\n');
    // const name = `${this.convertName(node)}Input`;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    return node.kind;
    // return node.fields.map(f => f.name.value).join('\n');
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const result = this.convertSelectionSet(node.name.value, node.selectionSet);

    const variablesDeclaration = `class ${node.name.value}Variables(BaseModel):`;
    const variablesBody = node.variableDefinitions
      .map(this.convertVariableDefinition)
      .filter(Boolean)
      .join(`\n${this.indent}`);

    return (variablesBody ? `${variablesDeclaration}\n${this.indent}${variablesBody}\n\n` : '') + `${result}`;
  }

  FragmentDefinition(node: FragmentDefinitionNode): string {
    return node.kind;
  }

  convertSelectionSet(name: string, node: SelectionSetNode): string {
    const resultDeclaration = `class ${name}(BaseModel):`;

    const things = node.selections.map(this.convertSelection).filter(Boolean);

    if (things.length > 0) {
      return `${resultDeclaration}\n${this.indent + things.join(`\n${this.indent}`)}`;
    } else {
      return `${resultDeclaration}\n${this.indent}pass`;
    }
  }

  convertSelection(node: SelectionNode): string {
    if (node.kind === 'Field') {
      return node.name.value;
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
