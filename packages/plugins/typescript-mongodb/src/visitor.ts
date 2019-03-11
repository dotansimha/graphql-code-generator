import { TsVisitor, TypeScriptPluginParsedConfig } from 'graphql-codegen-typescript';
import { Directives, TypeScriptPluginConfig } from './index';
import { ASTNode, DirectiveNode, Kind, GraphQLSchema, isEnumType, isObjectType, FieldDefinitionNode } from 'graphql';
import {
  BaseVisitorConvertOptions,
  getConfigValue,
  ConvertOptions,
  indent
} from 'graphql-codegen-visitor-plugin-common';

export interface TypeScriptMongoPluginParsedConfig extends TypeScriptPluginParsedConfig {
  dbTypeSuffix: string;
  dbInterfaceSuffix: string;
  objectIdType: string;
  idFieldName: string;
  enumsAsString: boolean;
}

type Directivable = { directives?: ReadonlyArray<DirectiveNode> };

export class TsMongoVisitor extends TsVisitor<TypeScriptPluginConfig, TypeScriptMongoPluginParsedConfig> {
  constructor(private _schema: GraphQLSchema, pluginConfig: TypeScriptPluginConfig) {
    super(pluginConfig, {
      dbTypeSuffix: pluginConfig.dbTypeSuffix || 'DbObject',
      dbInterfaceSuffix: pluginConfig.dbInterfaceSuffix || 'DbInterface',
      objectIdType: pluginConfig.objectIdType || 'ObjectID',
      idFieldName: pluginConfig.idFieldName || '_id',
      enumsAsString: getConfigValue<boolean>(pluginConfig.enumsAsString, true)
    });
  }

  private _getDirective(node: Directivable, directiveName: Directives): DirectiveNode | null {
    if (!node || !node.directives || node.directives.length === 0) {
      return null;
    }

    const foundDirective = node.directives.find(
      d => (d.name as any) === directiveName || (d.name.value && d.name.value === directiveName)
    );

    if (!foundDirective) {
      return null;
    }

    return foundDirective;
  }

  // FieldDefinition(node: FieldDefinitionNode, key: string | number, parent: any): string {
  //   const idDirective = this._getDirective(node, Directives.ID);
  //   const linkDirective = this._getDirective(node, Directives.LINK);
  //   const columnDirective = this._getDirective(node, Directives.COLUMN);
  //   const embeddedDirective = this._getDirective(node, Directives.EMBEDDED);
  //   const originalNode: FieldDefinitionNode = parent[key];

  //   if (idDirective !== null) {
  //     return indent(
  //       `${this.config.immutableTypes ? 'readonly ' : ''}${this.config.idFieldName}: ${this.config.objectIdType},`
  //     );
  //   } else if (linkDirective !== null) {
  //     const type = this._argumentsTransformer.wrapAstTypeWithModifiers(
  //       this.convertName(originalNode, { suffix: this.config.dbTypeSuffix }) + `['${this.config.idFieldName}']`,
  //       originalNode.type
  //     );
  //     const addOptionalSign = !this.config.avoidOptionals && originalNode.type.kind !== 'NonNullType';

  //     return indent(
  //       `${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${type},`
  //     );
  //   } else if (columnDirective !== null) {
  //     return super.FieldDefinition(node, key, parent);
  //   } else if (embeddedDirective !== null) {
  //     return super.FieldDefinition(node, key, parent);
  //   }

  //   return null;
  // }

  protected convertName(node: ASTNode | string, options?: BaseVisitorConvertOptions & ConvertOptions): string {
    if (typeof node !== 'string') {
      if (node.kind === Kind.OBJECT_TYPE_DEFINITION) {
        const entityDirective = this._getDirective(node, Directives.ENTITY);

        return super.convertName(node, {
          ...options,
          ...(entityDirective ? { suffix: this.config.dbTypeSuffix } : {})
        });
      } else if (node.kind === Kind.NAMED_TYPE) {
        const actualType = this._schema.getType(node.name as any);

        if (isEnumType(actualType) && this.config.enumsAsString) {
          return this.scalars.String;
        } else if (isObjectType(actualType)) {
          return super.convertName(node, {
            ...options,
            suffix: this.config.dbTypeSuffix
          });
        }

        return super.convertName(node, options);
      }
    }

    return super.convertName(node, options);
  }
}
