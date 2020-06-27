import {
  wrapWithSingleQuotes,
  DeclarationBlock,
  indent,
  BaseTypesVisitor,
  ParsedTypesConfig,
  DeclarationKind,
  buildScalars,
  ParsedScalarsMap,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { PythonPluginConfig } from './config';
import {
  FieldDefinitionNode,
  NamedTypeNode,
  ListTypeNode,
  NonNullTypeNode,
  EnumTypeDefinitionNode,
  GraphQLSchema,
  isEnumType,
  ObjectTypeDefinitionNode,
  EnumValueDefinitionNode,
  UnionTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
} from 'graphql';
import { PythonOperationVariablesToObject } from './python-variables-to-object';
import { PythonDeclarationBlock, transformPythonComment } from './declaration-block';
import { PythonScalars } from './scalars';

const flatMap = require('array.prototype.flatmap');

export interface PythonPluginParsedConfig extends ParsedTypesConfig {
  scalars: ParsedScalarsMap;
}

export class PyVisitor<
  PyRawConfig extends PythonPluginConfig = PythonPluginConfig,
  PyParsedConfig extends PythonPluginParsedConfig = PythonPluginParsedConfig
> extends BaseTypesVisitor<PyRawConfig, PyParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: PyRawConfig, additionalConfig: Partial<PyParsedConfig> = {}) {
    super(
      schema,
      {
        ...pluginConfig,
        declarationKind: {
          scalar: 'scalar',
        },
      },
      {
        ...additionalConfig,
        scalars: buildScalars(schema, pluginConfig.scalars, PythonScalars, 'Any'),
      } as PyParsedConfig,
      PythonScalars
    );

    autoBind(this);
    const enumNames = Object.values(schema.getTypeMap())
      .filter(isEnumType)
      .map(type => type.name);
    this.setArgumentsTransformer(
      new PythonOperationVariablesToObject(
        this.scalars,
        this.convertName,
        null,
        enumNames,
        pluginConfig.enumPrefix,
        this.config.enumValues
      )
    );
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
      ignoreExport: true,
    });
  }

  public getWrapperDefinitions(): string[] {
    return [];
  }

  public getScalarsImports(): string[] {
    return [
      'from typing import Optional, List, Literal, Union, Any',
      'from enum import Enum',
      ...super.getScalarsImports(),
    ];
  }

  protected _getScalar(name: string): string {
    return `Scalars.${name}`;
  }

  public get scalarsDefinition(): string {
    const allScalars = Object.keys(this.config.scalars).map(scalarName => {
      const scalarValue = this.config.scalars[scalarName].type;
      const scalarType = this._schema.getType(scalarName);
      const comment =
        scalarType && scalarType.astNode && scalarType.description
          ? transformPythonComment(scalarType.description, 1)
          : '';

      return comment + indent(`${scalarName} = Union[${scalarValue}]`);
    });

    return new PythonDeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.scalar)
      .withName('Scalars')
      .withBlock(allScalars.join('\n')).string;
  }

  protected clearOptional(str: string): string {
    if (str.startsWith('Optional')) {
      return str.replace(/Optional\[(.*?)\]$/, '$1');
    }

    return str;
  }

  protected getExportPrefix(): string {
    return '';
  }

  protected _getTypeForNode(node: NamedTypeNode): string {
    const typeAsString = (node.name as any) as string;

    if (this.scalars[typeAsString] || this.config.enumValues[typeAsString]) {
      return super._getTypeForNode(node);
    } else {
      return `"__GQL_CODEGEN_${super._getTypeForNode(node)}__"`;
    }
  }

  NamedType(node: NamedTypeNode, key, parent, path, ancestors): string {
    return `Optional[${super.NamedType(node, key, parent, path, ancestors)}]`;
  }

  ListType(node: ListTypeNode): string {
    return `Optional[${super.ListType(node)}]`;
  }

  protected wrapWithListType(str: string): string {
    return `${this.config.immutableTypes ? 'List' : 'List'}[${str}]`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    return this.clearOptional(baseValue);
  }

  getObjectTypeDeclarationBlock(
    node: ObjectTypeDefinitionNode,
    originalNode: ObjectTypeDefinitionNode
  ): DeclarationBlock {
    const { type } = this._parsedConfig.declarationKind;

    const allFields = ([...node.fields] as unknown) as string[];
    if (this.config.addTypename) {
      const typename = node.name;
      const literal = `Literal["${typename}"]`;
      const type = this.config.nonOptionalTypename ? literal : `Optional[${literal}]`;

      allFields.unshift(indent(`__typename: ${type}`));
    }

    const interfacesNames = originalNode.interfaces ? originalNode.interfaces.map(i => this.convertName(i)) : [];

    const declarationBlock = new PythonDeclarationBlock({
      ...this._declarationBlockConfig,
    })
      .export()
      .asKind('class')
      .withName(this.convertName(node))
      .withComment((node.description as any) as string);

    if (type === 'interface' || type === 'class') {
      if (interfacesNames.length > 0) {
        declarationBlock.withContent(' extends ' + interfacesNames.join(', ') + (allFields.length > 0 ? ' ' : ' {}'));
      }

      declarationBlock.withBlock(this.mergeAllFields(allFields, false));
    } else {
      this.appendInterfacesAndFieldsToBlock(declarationBlock, interfacesNames, allFields);
    }

    return declarationBlock;
  }

  FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): string {
    const typeString = (node.type as any) as string;
    const comment = this.getFieldComment(node);
    const { type } = this.config.declarationKind;

    return (
      comment +
      indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}: ${typeString}${this.getPunctuation(type)}`)
    );
  }

  getInputObjectDeclarationBlock(node: InputObjectTypeDefinitionNode): DeclarationBlock {
    return new PythonDeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.input)
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withBlock(node.fields.join('\n'));
  }

  getArgumentsObjectDeclarationBlock(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): DeclarationBlock {
    return new PythonDeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.arguments)
      .withName(this.convertName(name))
      .withComment(node.description)
      .withBlock(this._argumentsTransformer.transform<InputValueDefinitionNode>(field.arguments));
  }

  getFieldComment(node: FieldDefinitionNode): string {
    let commentText: string = node.description as any;
    const deprecationDirective = node.directives.find((v: any) => v.name === 'deprecated');
    if (deprecationDirective) {
      const deprecationReason = this.getDeprecationReason(deprecationDirective);
      commentText = `${commentText ? `${commentText}\n` : ''}@deprecated ${deprecationReason}`;
    }
    const comment = transformPythonComment(commentText, 1);
    return comment;
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    const comment = transformPythonComment(node.description, 1);

    return comment + indent(`${node.name}: ${node.type}`);
  }

  protected buildEnumValuesBlock(typeName: string, values: ReadonlyArray<EnumValueDefinitionNode>) {
    return values
      .map(enumOption => {
        const optionName = this.convertName(enumOption, {
          useTypesPrefix: false,
          transformUnderscore: true,
        });
        const comment = transformPythonComment((enumOption.description as any) as string, 1);
        let enumValue: string | number = enumOption.name as any;

        if (
          this.config.enumValues[typeName] &&
          this.config.enumValues[typeName].mappedValues &&
          typeof this.config.enumValues[typeName].mappedValues[enumValue] !== 'undefined'
        ) {
          enumValue = this.config.enumValues[typeName].mappedValues[enumValue];
        }

        return (
          comment +
          indent(
            `${optionName}${this._declarationBlockConfig.enumNameValueSeparator} ${wrapWithSingleQuotes(enumValue)}`
          )
        );
      })
      .join('\n');
  }

  getInterfaceTypeDeclarationBlock(
    node: InterfaceTypeDefinitionNode,
    originalNode: InterfaceTypeDefinitionNode
  ): DeclarationBlock {
    const declarationBlock = new PythonDeclarationBlock({})
      .export()
      .asKind(this._parsedConfig.declarationKind.interface)
      .withName(this.convertName(node))
      .withComment((node.description as any) as string);

    return declarationBlock.withBlock(node.fields.join('\n'));
  }

  protected mergeInterfaces(interfaces: string[]): string {
    if (interfaces.length === 0) return '';

    return `(${interfaces.join(', ')})`;
  }

  protected _buildTypeImport(identifier: string, source: string): string {
    return `from ${source} import ${identifier}`;
  }

  handleEnumValueMapper(
    typeIdentifier: string,
    importIdentifier: string | null,
    sourceIdentifier: string | null,
    sourceFile: string | null
  ): string[] {
    const importStatement = this._buildTypeImport(importIdentifier || sourceIdentifier, sourceFile);

    if (importIdentifier !== sourceIdentifier || sourceIdentifier !== typeIdentifier) {
      return [importStatement, `${typeIdentifier} = ${sourceIdentifier}`];
    }

    return [importStatement];
  }

  public getEnumsImports(): string[] {
    return flatMap(Object.keys(this.config.enumValues), enumName => {
      const mappedValue = this.config.enumValues[enumName];

      if (mappedValue.sourceFile) {
        return this.handleEnumValueMapper(
          mappedValue.typeIdentifier,
          mappedValue.importIdentifier,
          mappedValue.sourceIdentifier,
          mappedValue.sourceFile
        );
      }

      return [];
    }).filter(a => a);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = (node.name as any) as string;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName] && this.config.enumValues[enumName].sourceFile) {
      return '';
    }

    const enumTypeName = this.convertName(node, { useTypesPrefix: this.config.enumPrefix });

    return new PythonDeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('enum')
      .withName(enumTypeName)
      .withComment((node.description as any) as string)
      .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number | undefined, parent: any): string {
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types
      .map(t => (this.scalars[t.name.value] ? this._getScalar(t.name.value) : this._getTypeForNode(t)))
      .join(', ');

    return new PythonDeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('union')
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withContent(possibleTypes).string;
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return '';
  }
}
