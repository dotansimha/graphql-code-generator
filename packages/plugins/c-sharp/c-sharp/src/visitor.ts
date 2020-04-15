import { ParsedConfig, BaseVisitor, EnumValuesMap, indentMultiline, indent, buildScalars, getBaseTypeNode } from '@graphql-codegen/visitor-plugin-common';
import { CSharpResolversPluginRawConfig } from './config';
import {
  GraphQLSchema,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  TypeNode,
  Kind,
  isScalarType,
  isInputObjectType,
  isEnumType } from 'graphql';
import { C_SHARP_SCALARS, CSharpDeclarationBlock, wrapTypeWithModifiers } from './common/common';

export interface CSharpResolverParsedConfig extends ParsedConfig {
  package: string;
  className: string;
  listType: string;
  enumValues: EnumValuesMap;
}

export class CSharpResolversVisitor extends BaseVisitor<CSharpResolversPluginRawConfig, CSharpResolverParsedConfig> {

  constructor(rawConfig: CSharpResolversPluginRawConfig, private _schema: GraphQLSchema, defaultPackageName: string) {
    super(rawConfig, {
      enumValues: rawConfig.enumValues || {},
      listType: rawConfig.listType || 'List',
      className: rawConfig.className || 'Types',
      package: rawConfig.package || defaultPackageName,
      scalars: buildScalars(_schema, rawConfig.scalars, C_SHARP_SCALARS),
    });
  }

  public getImports(): string {
    const allImports = ['System', 'System.Collections.Generic', 'Newtonsoft.Json', 'GraphQL'];
    return allImports.map(i => `using ${i};`).join('\n') + '\n';
  }

  public wrapWithClass(content: string): string {
    return new CSharpDeclarationBlock()
      .access('public')
      .asKind('class')
      .withName(this.config.className)
      .withBlock(indentMultiline(content)).string;
  }

  public getPackageName(): string {
    return '';
  }

  protected getEnumValue(enumName: string, enumOption: string): string {
    if (this.config.enumValues[enumName] && typeof this.config.enumValues[enumName] === 'object' && this.config.enumValues[enumName][enumOption]) {
      return this.config.enumValues[enumName][enumOption];
    }

    return enumOption;
  }


  EnumValueDefinition(node: EnumValueDefinitionNode): (enumName: string) => string {
    return (enumName: string) => {
      return indent(`${this.getEnumValue(enumName, node.name.value)}`);
    };
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = this.convertName(node.name);
    const enumValues = node.values.map(enumValue => (enumValue as any)(node.name.value)).join(',\n');
    const enumBlock = [enumValues].join('\n');

    return new CSharpDeclarationBlock()
      .access('public')
      .asKind('enum')
      .withComment(node.description)
      .withName(enumName)
      .withBlock(enumBlock).string;
  }

  protected resolveInputFieldType(typeNode: TypeNode): { baseType: string; typeName: string; isScalar: boolean; isArray: boolean } {
    const innerType = getBaseTypeNode(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);
    const isArray = typeNode.kind === Kind.LIST_TYPE || (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE);
    let result: { baseType: string; typeName: string; isScalar: boolean; isArray: boolean } = null;

    if (isScalarType(schemaType)) {
      if (this.scalars[schemaType.name]) {
        result = {
          baseType: this.scalars[schemaType.name],
          typeName: this.scalars[schemaType.name],
          isScalar: true,
          isArray,
        };
      } else {
        result = { isArray, baseType: 'Object', typeName: 'Object', isScalar: true };
      }
    } else if (isInputObjectType(schemaType)) {
      result = {
        baseType: `${this.convertName(schemaType.name)}`,
        typeName: `${this.convertName(schemaType.name)}`,
        isScalar: false,
        isArray,
      };
    } else if (isEnumType(schemaType)) {
      result = { isArray, baseType: this.convertName(schemaType.name), typeName: this.convertName(schemaType.name), isScalar: true };
    } else {
      result =  {
        baseType: `${schemaType.name}`,
        typeName: `${schemaType.name}`,
        isScalar: false,
        isArray,
      };
    }

    if (result) {
      result.typeName = wrapTypeWithModifiers(result.typeName, typeNode, this.config.listType);
    }

    return result;
  }

  protected buildObject(name: string, inputValueArray: ReadonlyArray<FieldDefinitionNode>): string {

    const classMembers = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);
        return indent(`
          [JsonProperty("${arg.name.value}")]
          public ${typeToUse.typeName} ${arg.name.value} { get; set;}
        `);
      })
      .join('\n');

      return `
#region ${name}
public class ${name} {
  #region members
  ${classMembers}
  #endregion
}
#endregion
`;
  }

  protected buildInputTransfomer(name: string, inputValueArray: ReadonlyArray<InputValueDefinitionNode>): string {

    const classMembers = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);

        return indent(`public ${typeToUse.typeName} ${arg.name.value} { get; set;}`);
      })
      .join('\n');

    const getInputObject = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);
        if (typeToUse.typeName === 'DateTime') {
          return indent(`
            if (this.${arg.name.value} != default(DateTime))
            {
              d["${arg.name.value}"] = ${arg.name.value};
            }`);
        } else if (typeToUse.typeName === 'int' || typeToUse.typeName === 'float') {
          return indent(`
            if (this.${arg.name.value} != 0)
            {
              d["${arg.name.value}"] = ${arg.name.value};
            }`);
        } else {
          return indent(`
            if (this.${arg.name.value} != null)
            {
              d["${arg.name.value}"] = ${arg.name.value};
            }`);
        }
      })
      .join('\n');

      return `
#region ${name}
public class ${name} {
  #region members
  ${classMembers}
  #endregion

  #region methods
  public System.Dynamic.ExpandoObject getInputObject(){
    dynamic eo = new System.Dynamic.ExpandoObject();
    IDictionary<string, object> d = (IDictionary<string, object>)eo;
    ${getInputObject}
    return eo;
  }
  #endregion


}
#endregion
`;
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const name = `${this.convertName(node)}`;
    return this.buildInputTransfomer(name, node.fields);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    return this.buildObject(node.name.value, node.fields);
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    return this.buildObject(node.name.value, node.fields);
  }
}
