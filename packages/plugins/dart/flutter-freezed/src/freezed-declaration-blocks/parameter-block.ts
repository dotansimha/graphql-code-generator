import { indent } from '@graphql-codegen/visitor-plugin-common';
import { ListTypeNode, NamedTypeNode, NonNullTypeNode, TypeNode } from 'graphql';
import { camelCase } from 'change-case-all';
import { ApplyDecoratorOn, FlutterFreezedPluginConfig } from '../config.js';
import { getCustomDecorators, transformCustomDecorators, FieldType, FreezedConfigValue, NodeType } from '../utils.js';

/**
 * maps GraphQL scalar types to Dart's scalar types
 */
export const DART_SCALARS: Record<string, string> = {
  ID: 'String',
  String: 'String',
  Boolean: 'bool',
  Int: 'int',
  Float: 'double',
  DateTime: 'DateTime',
};

export class FreezedParameterBlock {
  /** document the property */
  _comment = '';

  /** a list of decorators to copy paste to the generator */
  _decorators: string[] = [];

  /** mark the property as required */
  _required: boolean | undefined;

  /** mark the property as required */
  // _type?: ParameterType = 'named';
  _type: string | undefined;

  /** the name of the property */
  _name: string | undefined;

  /** the shape is the content of the block */
  _shape: string | undefined;

  /** the block is the final structure that is generated */
  _block: string | undefined;

  private _freezedConfigValue: FreezedConfigValue;

  constructor(
    private _config: FlutterFreezedPluginConfig,
    private _appliesOn: ApplyDecoratorOn[],
    private _node: NodeType,
    private _field: FieldType
  ) {
    this._config = _config;
    this._appliesOn = _appliesOn;
    this._node = _node;
    this._field = _field;

    this._freezedConfigValue = new FreezedConfigValue(_config, _node.name.value);
  }

  public init(): FreezedParameterBlock {
    this.setComment().setDecorators().setRequired().setType().setName().setShape().setBlock();
    return this;
  }

  private setComment(): FreezedParameterBlock {
    const comment = this._field.description?.value;

    if (comment && comment !== null && comment !== '') {
      this._comment = indent(`/// ${comment}\n`, 2);
    }
    return this;
  }

  private setDecorators(): FreezedParameterBlock {
    const nodeName = this._node.name.value;
    const fieldName = this._field.name.value;

    // determine if should mark as deprecated
    const isDeprecated = this._config.typeSpecificFreezedConfig?.[nodeName]?.fields?.[fieldName]?.deprecated;
    const defaultValue = this._config.typeSpecificFreezedConfig?.[nodeName]?.fields?.[fieldName]?.defaultValue;

    if (this._freezedConfigValue.get('alwaysUseJsonKeyName') || fieldName !== camelCase(fieldName)) {
      this._decorators = [...this._decorators, `@JsonKey(name: '${fieldName}')`];
    }

    this._decorators = [
      ...this._decorators,
      ...transformCustomDecorators(
        getCustomDecorators(this._config, this._appliesOn, this._node.name.value, fieldName),
        this._node,
        this._field
      ),
    ];

    // @deprecated
    // if this._decorators doesn't include an @deprecated decorator but the field is marked as @deprecated...
    if (!this._decorators.includes('@deprecated') && isDeprecated) {
      this._decorators = [...this._decorators, '@deprecated'];
    }

    // @Default
    if (defaultValue) {
      //overwrite the customDecorator's defaultValue
      this._decorators = this._decorators.filter(d => !d.startsWith('@Default'));
      this._decorators = [...this._decorators, `@Default(value: ${defaultValue})`];
    }
    return this;
  }

  private setRequired(): FreezedParameterBlock {
    this._required = this.isNonNullType(this._field.type);
    return this;
  }

  private setType(): FreezedParameterBlock {
    this._type = this.propertyType(this._field, this._field.type);
    return this;
  }

  private setName(): FreezedParameterBlock {
    this._name = camelCase(this._field.name.value);
    return this;
  }

  /** compose the freezed constructor property */
  private setShape(): FreezedParameterBlock {
    let shape = '';
    const nodeName = this._node.name.value;
    const fieldName = this._field.name.value;

    // determine if should mark as final
    const isFinal =
      this._decorators.includes('final') ||
      this._config.typeSpecificFreezedConfig?.[nodeName]?.fields?.[fieldName]?.final;

    //append comment
    shape += this._comment;

    // append the decorators
    shape += this._decorators
      .filter(d => d !== 'final')
      .map(d => indent(`${d}\n`, 2))
      .join('');

    // append required for non-nullable types
    shape += indent(this._required ? 'required ' : '', 2);

    // append isFinal
    shape += isFinal ? 'final ' : '';

    // append the Dart Type, name and trailing comma
    shape += `${this._type} ${this._name},\n`;

    // store it in the shape
    this._shape = shape;

    return this;
  }

  /** composes the full block */
  private setBlock(): FreezedParameterBlock {
    this._block = this._shape;
    return this;
  }

  private propertyType = (field: FieldType, type: TypeNode, parentType?: TypeNode): string => {
    if (this.isNonNullType(type)) {
      return this.propertyType(field, type.type, type);
    }

    if (this.isListType(type)) {
      const T = this.propertyType(field, type.type, type);
      return `List<${T}>${this.isNonNullType(parentType) ? '' : '?'}`;
    }

    if (this.isNamedType(type)) {
      return `${this.scalar(type.name.value)}${this.isNonNullType(parentType) ? '' : '?'}`;
    }

    return '';
  };

  private isListType = (type?: TypeNode): type is ListTypeNode => type?.kind === 'ListType';

  private isNonNullType = (type?: TypeNode): type is NonNullTypeNode => type?.kind === 'NonNullType';

  private isNamedType = (type?: TypeNode): type is NamedTypeNode => type?.kind === 'NamedType';

  private scalar(_scalar: string): string {
    if (this._config?.customScalars?.[_scalar]) {
      return this._config.customScalars[_scalar];
    }
    if (DART_SCALARS[_scalar]) {
      return DART_SCALARS[_scalar];
    }
    return _scalar;
  }

  /** returns the block */
  public toString(): string {
    if (!this._block) {
      throw new Error('FreezedParameterBlock: setShape must be called before calling toString()');
    }
    return this._block;
  }
}
