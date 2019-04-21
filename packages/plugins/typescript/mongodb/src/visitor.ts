import { FieldsTree } from './fields-tree';
import { getBaseTypeNode, DeclarationBlock, getConfigValue, ParsedConfig, BaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptOperationVariablesToObject } from '@graphql-codegen/typescript';
import * as autoBind from 'auto-bind';
import { Directives, TypeScriptMongoPluginConfig } from './index';
import { DirectiveNode, GraphQLSchema, ObjectTypeDefinitionNode, NamedTypeNode, FieldDefinitionNode, Kind, ValueNode, isEnumType, InterfaceTypeDefinitionNode, UnionTypeDefinitionNode } from 'graphql';

type AdditionalField = { path: string; type: string };
export interface TypeScriptMongoPluginParsedConfig extends ParsedConfig {
  dbTypeSuffix: string;
  dbInterfaceSuffix: string;
  objectIdType: string;
  objectIdImport: string;
  idFieldName: string;
  enumsAsString: boolean;
  avoidOptionals: boolean;
}

type Directivable = { directives?: ReadonlyArray<DirectiveNode> };

function resolveObjectId(pointer: string | null | undefined): { identifier: string; module: string } {
  if (!pointer) {
    return { identifier: 'ObjectID', module: 'mongodb' };
  }

  if (pointer.includes('#')) {
    const [path, module] = pointer.split('#');

    return { identifier: path, module };
  }

  return {
    identifier: pointer,
    module: null,
  };
}

export class TsMongoVisitor extends BaseVisitor<TypeScriptMongoPluginConfig, TypeScriptMongoPluginParsedConfig> {
  private _variablesTransformer: TypeScriptOperationVariablesToObject;

  constructor(private _schema: GraphQLSchema, pluginConfig: TypeScriptMongoPluginConfig) {
    super(pluginConfig, ({
      dbTypeSuffix: pluginConfig.dbTypeSuffix || 'DbObject',
      dbInterfaceSuffix: pluginConfig.dbInterfaceSuffix || 'DbInterface',
      objectIdType: resolveObjectId(pluginConfig.objectIdType).identifier,
      objectIdImport: resolveObjectId(pluginConfig.objectIdType).module,
      idFieldName: pluginConfig.idFieldName || '_id',
      enumsAsString: getConfigValue<boolean>(pluginConfig.enumsAsString, true),
      avoidOptionals: getConfigValue<boolean>(pluginConfig.avoidOptionals, false),
    } as Partial<TypeScriptMongoPluginParsedConfig>) as any);
    autoBind(this);
    this._variablesTransformer = new TypeScriptOperationVariablesToObject(this.scalars, this.convertName, false, false);
  }

  public get objectIdImport(): string {
    if (this.config.objectIdImport === null) {
      return null;
    }

    return `import { ${this.config.objectIdType} } from '${this.config.objectIdImport}';`;
  }

  private _resolveDirectiveValue<T>(valueNode: ValueNode): T | undefined | null {
    switch (valueNode.kind) {
      case Kind.INT:
      case Kind.STRING:
      case Kind.FLOAT:
      case Kind.BOOLEAN:
      case Kind.ENUM:
        return (valueNode.value as any) as T;
      case Kind.LIST:
        return (valueNode.values.map(v => this._resolveDirectiveValue<T>(v)) as any) as T;
      case Kind.NULL:
        return null;
      case Kind.OBJECT:
        return valueNode.fields.reduce(
          (prev, f) => {
            return {
              ...prev,
              [f.name.value]: this._resolveDirectiveValue<T>(f.value),
            };
          },
          {} as T
        );
      default:
        return undefined;
    }
  }

  private _getDirectiveArgValue<T>(node: DirectiveNode, argName: string): T | null | undefined {
    if (!node || !node.arguments || node.arguments.length === 0) {
      return undefined;
    }

    const foundArgument = node.arguments.find(a => a.name.value === argName);

    if (!foundArgument) {
      return undefined;
    }

    return this._resolveDirectiveValue<T>(foundArgument.value);
  }

  private _getDirectiveFromAstNode(node: Directivable, directiveName: Directives): DirectiveNode | null {
    if (!node || !node.directives || node.directives.length === 0) {
      return null;
    }

    const foundDirective = node.directives.find(d => (d.name as any) === directiveName || (d.name.value && d.name.value === directiveName));

    if (!foundDirective) {
      return null;
    }

    return foundDirective;
  }

  private _buildInterfaces(interfaces: ReadonlyArray<NamedTypeNode>): string[] {
    return (interfaces || [])
      .map(namedType => {
        const schemaType = this._schema.getType(namedType.name.value);
        const abstractEntityDirective = this._getDirectiveFromAstNode(schemaType.astNode, Directives.ABSTRACT_ENTITY);

        if (!abstractEntityDirective) {
          return null;
        }

        return this.convertName(namedType.name.value, { suffix: this.config.dbInterfaceSuffix });
      })
      .filter(a => a);
  }

  private _handleIdField(fieldNode: FieldDefinitionNode, tree: FieldsTree, addOptionalSign: boolean): void {
    tree.addField(`${this.config.idFieldName}${addOptionalSign ? '?' : ''}`, this._variablesTransformer.wrapAstTypeWithModifiers(this.config.objectIdType, fieldNode.type));
  }

  private _handleLinkField(fieldNode: FieldDefinitionNode, tree: FieldsTree, linkDirective: DirectiveNode, mapPath: string | null, addOptionalSign: boolean): void {
    const overrideType = this._getDirectiveArgValue<string>(linkDirective, 'overrideType');
    const coreType = overrideType ? overrideType : getBaseTypeNode(fieldNode.type);
    const type = this.convertName(coreType, { suffix: this.config.dbTypeSuffix });

    tree.addField(mapPath ? mapPath : `${fieldNode.name.value}${addOptionalSign ? '?' : ''}`, this._variablesTransformer.wrapAstTypeWithModifiers(`${type}['${this.config.idFieldName}']`, fieldNode.type));
  }

  private _handleColumnField(fieldNode: FieldDefinitionNode, tree: FieldsTree, columnDirective: DirectiveNode, mapPath: string | null, addOptionalSign: boolean): void {
    const overrideType = this._getDirectiveArgValue<string>(columnDirective, 'overrideType');
    const coreType = getBaseTypeNode(fieldNode.type);
    let type: string = null;

    if (this.scalars[coreType.name.value]) {
      type = this.scalars[coreType.name.value];
    } else {
      const schemaType = this._schema.getType(coreType.name.value);

      if (isEnumType(schemaType) && this.config.enumsAsString) {
        type = this.scalars.String;
      } else {
        type = coreType.name.value;
      }
    }

    tree.addField(mapPath ? mapPath : `${fieldNode.name.value}${addOptionalSign ? '?' : ''}`, overrideType ? overrideType : this._variablesTransformer.wrapAstTypeWithModifiers(type, fieldNode.type));
  }

  private _handleEmbeddedField(fieldNode: FieldDefinitionNode, tree: FieldsTree, mapPath: string | null, addOptionalSign: boolean): void {
    const coreType = getBaseTypeNode(fieldNode.type);
    const type = this.convertName(coreType, { suffix: this.config.dbTypeSuffix });

    tree.addField(mapPath ? mapPath : `${fieldNode.name.value}${addOptionalSign ? '?' : ''}`, this._variablesTransformer.wrapAstTypeWithModifiers(type, fieldNode.type));
  }

  private _buildFieldsTree(fields: ReadonlyArray<FieldDefinitionNode>): FieldsTree {
    const tree = new FieldsTree();

    fields.forEach(field => {
      const idDirective = this._getDirectiveFromAstNode(field, Directives.ID);
      const linkDirective = this._getDirectiveFromAstNode(field, Directives.LINK);
      const columnDirective = this._getDirectiveFromAstNode(field, Directives.COLUMN);
      const embeddedDirective = this._getDirectiveFromAstNode(field, Directives.EMBEDDED);
      const mapDirective = this._getDirectiveFromAstNode(field, Directives.MAP);
      const mapPath: string | null = this._getDirectiveArgValue<string>(mapDirective, 'path');
      const addOptionalSign = !this.config.avoidOptionals && field.type.kind !== Kind.NON_NULL_TYPE;

      if (idDirective) {
        this._handleIdField(field, tree, addOptionalSign);
      } else if (linkDirective) {
        this._handleLinkField(field, tree, linkDirective, mapPath, addOptionalSign);
      } else if (columnDirective) {
        this._handleColumnField(field, tree, columnDirective, mapPath, addOptionalSign);
      } else if (embeddedDirective) {
        this._handleEmbeddedField(field, tree, mapPath, addOptionalSign);
      }
    });

    return tree;
  }

  private _addAdditionalFields(tree: FieldsTree, additioalFields: AdditionalField[] | null): void {
    if (!additioalFields || additioalFields.length === 0) {
      return;
    }

    for (const field of additioalFields) {
      tree.addField(field.path, field.type);
    }
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    const abstractEntityDirective = this._getDirectiveFromAstNode(node, Directives.ABSTRACT_ENTITY);

    if (abstractEntityDirective === null) {
      return null;
    }

    const discriminatorField = this._getDirectiveArgValue<string>(abstractEntityDirective, 'discriminatorField');
    const additionalFields = this._getDirectiveArgValue<AdditionalField[]>(abstractEntityDirective, 'additionalFields');
    const fields = this._buildFieldsTree(node.fields);
    fields.addField(discriminatorField, this.scalars.String);
    this._addAdditionalFields(fields, additionalFields);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node, { suffix: this.config.dbInterfaceSuffix }))
      .withBlock(fields.string).string;
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode): string {
    const unionDirective = this._getDirectiveFromAstNode(node, Directives.UNION);

    if (unionDirective === null) {
      return null;
    }

    const discriminatorField = this._getDirectiveArgValue<string>(unionDirective, 'discriminatorField');
    const possibleTypes = node.types
      .map(namedType => {
        const schemaType = this._schema.getType(namedType.name.value);
        const entityDirective = this._getDirectiveFromAstNode(schemaType.astNode, Directives.ENTITY);
        const abstractEntityDirective = this._getDirectiveFromAstNode(schemaType.astNode, Directives.ABSTRACT_ENTITY);

        if (entityDirective) {
          return this.convertName(namedType, { suffix: this.config.dbTypeSuffix });
        } else if (abstractEntityDirective) {
          return this.convertName(namedType, { suffix: this.config.dbInterfaceSuffix });
        }

        return null;
      })
      .filter(a => a);

    if (possibleTypes.length === 0) {
      return null;
    }

    const additionalFields = this._getDirectiveArgValue<AdditionalField[]>(unionDirective, 'additionalFields');
    const fields = new FieldsTree();
    fields.addField(discriminatorField, this.scalars.String);
    this._addAdditionalFields(fields, additionalFields);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node, { suffix: this.config.dbTypeSuffix }))
      .withContent(`(${possibleTypes.join(' | ')}) & `)
      .withBlock(fields.string).string;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    const entityDirective = this._getDirectiveFromAstNode(node, Directives.ENTITY);

    if (entityDirective === null) {
      return null;
    }

    const implementingInterfaces = this._buildInterfaces(node.interfaces);
    const fields = this._buildFieldsTree(node.fields);
    const additionalFields = this._getDirectiveArgValue<AdditionalField[]>(entityDirective, 'additionalFields');
    this._addAdditionalFields(fields, additionalFields);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node, { suffix: this.config.dbTypeSuffix }))
      .withContent(implementingInterfaces.length ? implementingInterfaces.join(' & ') + ' & ' : '')
      .withBlock(fields.string).string;
  }
}
