import { indent } from '@graphql-codegen/visitor-plugin-common';
import {
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  TypeNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { camelCase, pascalCase } from 'change-case-all';
import { FreezedPluginConfig } from './config';
import { DART_SCALARS } from './scalars';

export type ParameterType = 'positional' | 'named';
export type FieldType = FieldDefinitionNode | InputValueDefinitionNode;
export type FieldsType = FieldDefinitionNode[] | InputValueDefinitionNode[];
export type NodeType = ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode | UnionTypeDefinitionNode;

export class FreezedImportBlock {
  _importFreezedAnnotation?: boolean = true;
  _importFoundation?: boolean = true;
  _jsonSerializable?: boolean;

  // TODO: the constructor should accept a node, and extract it shape and store it but return itself
  constructor(private _config: FreezedPluginConfig, private _fileName?: string) {
    // this._fileName = _fileName;
  }

  string(): string {
    return [
      this._importFreezedAnnotation && "import 'package:freezed_annotation/freezed_annotation.dart';",
      this._importFoundation && "import 'package:flutter/foundation.dart';",
      `part ${this.getFileName(this._fileName)}.dart;`,
      this._jsonSerializable && `part '${this.getFileName(this._fileName)}.g.dart';`,
    ].join('\n');
  }

  /**
   *  returns the fileName without the extension.
   * if modular is set to, returns the value of fileName from the config
   */
  getFileName(fileName?: string) {
    const modular: boolean = this._config.modular ?? true;
    const defaultFileName: string = this._config.fileName.replace('.dart', '') ?? 'app_models';
    return modular ? defaultFileName : fileName.replace('.dart', '');
  }
}

export class FreezedFactoryBlockRepository {
  _store: Record<string, FreezedFactoryBlock> = {};

  register(key: string, value: FreezedFactoryBlock): FreezedFactoryBlock {
    this._store[key] = value;
    return value;
  }

  retrieve(key: string): FreezedFactoryBlock {
    return this._store[key];
  }

  resolve(replaceToken: string): string {
    const key = replaceToken.split('==>factory ')[-1];
    const factoryBlock = this.retrieve(key);

    if (factoryBlock) {
      factoryBlock.toString();
    }

    return '';
  }
}

export class FreezedDeclarationBlock {
  /** document the class  */
  _comment: string = null;

  /** a list of decorators to copy paste to the generator */
  // TODO: handle this decorators @Freezed(unionKey: 'type', unionValueCase: FreezedUnionCase.pascal)
  _decorators: string[] = [];

  /** the name of the class */
  _name: string = null;

  /** a list of default constructor and named Constructors used create a Freezed union/sealed class */
  _factoryBlocks: FreezedFactoryBlock[] = [];

  /** the shape is the content of the block */
  _shape: string = null;

  /** the block is the final structure that is generated */
  _block: string = null;

  constructor(
    private _config: FreezedPluginConfig,
    private _freezedFactoryBlockRepository: FreezedFactoryBlockRepository,
    private _node: NodeType
  ) {
    this._config = _config;
    this._freezedFactoryBlockRepository = _freezedFactoryBlockRepository;
    this._node = _node;

    this.init();
  }

  private init(): void {
    this.setComment().setDecorators().setName().setFactoryBlocks().setShape().setBlock();
  }

  private setComment(): FreezedDeclarationBlock {
    const comment = this._node.description?.value;

    if (comment !== null && comment !== '') {
      this._comment = `/// ${this._comment}\n`;
    }

    return this;
  }

  private setDecorators(): FreezedDeclarationBlock {
    // TODO: Get decorators from field directives or config
    // const d = this._field.directives
    // const defaultDecorator = this._defaultValue !== null ? `@Default(${this._defaultValue})` : '';
    // const deprecatedDecorator = this._deprecated ? '@deprecated' : '';
    const freezedDecorator = this._config.immutable
      ? this._config.makeCollectionsUnmodifiable !== null
        ? `@Freezed(makeCollectionsUnmodifiable: ${this._config.makeCollectionsUnmodifiable})` // TODO: copyWith and equal methods can be disabled here too
        : `@freezed()`
      : `@unfreezed`;
    // this._decorators = [...this._decorators, defaultDecorator, deprecatedDecorator, jsonKeyNameDecorator,]

    this._decorators = [freezedDecorator];
    return this;
  }

  private setName(): FreezedDeclarationBlock {
    // TODO: name should be PascalCased
    this._name = this._node.name.value;
    return this;
  }

  private setFactoryBlocks(): FreezedDeclarationBlock {
    if (this._node.kind === Kind.UNION_TYPE_DEFINITION) {
      this._factoryBlocks = this._node.types?.map(
        (type: NamedTypeNode) => new FreezedFactoryBlock(this._config, this._node, type)
      );
    } else {
      /*
        for `ObjectTypeDefinitionNode` and `InputObjectTypeDefinitionNode` nodes,
        we use the `ShapeRepository`
        to register the `FreezedFactoryConstructorBlock` so that we can use later
        when we are merging inputs or generating freezed union/sealed classes
        for GraphQL union types
      */
      this._factoryBlocks = this._node.fields?.map((field: FieldDefinitionNode | InputValueDefinitionNode) =>
        this._freezedFactoryBlockRepository.register(
          this._node.name.value,
          new FreezedFactoryBlock(this._config, this._node, field)
        )
      );
    }
    return this;
  }

  private setShape(): FreezedDeclarationBlock {
    let shape = '';

    if (this._node.kind === Kind.UNION_TYPE_DEFINITION) {
      this._node.types.forEach(type => {
        const factoryBlockKey = type.name.value;
        shape += `==>factory ${factoryBlockKey}\n`;
      });
    } else if (this._node.kind === Kind.OBJECT_TYPE_DEFINITION && this._config.mergeInputs !== null) {
      // replace token for the ObjectType(a.k.a the default Freezed constructor)
      shape += `==>factory ${this._node.name.value}`;

      // replace token for the InputTypes(a.k.a namedConstructors) as a union/sealed class
      this._config.mergeInputs.forEach(input => {
        const factoryBlockKey = input.replace('$', this._node.name.value);
        shape += `==>factory ${factoryBlockKey}\n`;
      });
    }

    this._shape = shape;

    return this;
  }

  /**
   * returns the string output of the block
   */
  private setBlock(): FreezedDeclarationBlock {
    let block = '';

    //append comment
    block += `${this._comment}\n`;

    // append the decorators
    block += this._decorators.map(d => `${d}\n`);

    // append start of class definition
    block += `class ${this._name} with _$${this._name} {\n`;

    // append private empty constructor
    if (this._config.privateEmptyConstructor ?? true) {
      block += indent(`const ${this._name}._()\n`);
    }

    block += indent(`${this._shape}\n`);

    // append fromJson
    if (this._config.fromJsonToJson ?? true) {
      block += indent(`factory ${this._name}.fromJson(Map<String, dynamic> json) => _${this._name}FromJson(json);\n`);
    }

    //append end of class definition
    block += '}\n';

    this._block = block;

    return this;
  }

  /** returns the block */
  public toString(): string {
    if (this._block === null) {
      throw new Error('setShape must be called before calling toString()');
    }
    return this._block;
  }
}

export class FreezedFactoryBlock {
  /** document the constructor */
  _comment: string = null;

  /** a list of decorators to copy paste to the generator */
  // TODO:  handle this decorator @FreezedUnionValue('SpecialCase')
  // _decorators: string[] = [];

  /** mark the factory constrictor as deprecated */
  // _deprecated?: boolean = null;

  /** the name of the class */
  _name: string = null;

  /** the typeName is used as the namedConstructor for GraphQL Union types or if mergeInput is true */
  _typeName?: string = null;

  /** a list of interfaces to implements */
  // _implements: string[] = [];

  /** a list of class to mixin with */
  // _mixins: string[] = [];

  /** the parameters of this factory constructor */
  // TODO: handle other parameter types like positional parameters later.
  // TODO: sticking to named parameters because GraphQL is a typed language
  _parameters: FreezedParameterBlock[] = [];

  /** the shape is the content of the block */
  _shape: string = null;

  /** the block is the final structure that is generated */
  _block: string = null;

  constructor(
    private _config: FreezedPluginConfig,
    private _node: NodeType,
    private _data?: NamedTypeNode | FieldDefinitionNode | InputValueDefinitionNode
  ) {
    this._config = _config;
    this._node = _node;
    this._data = _data;

    this.init();
  }

  private init(): void {
    this.setComment().setName().setType().setParameters().setShape().setBlock();
  }

  private setComment(): FreezedFactoryBlock {
    const comment = this._node.description?.value;

    if (comment !== null && comment !== '') {
      this._comment = `/// ${this._comment}\n`;
    }
    return this;
  }

  private setName(): FreezedFactoryBlock {
    this._name = pascalCase(this._node.name.value).replace(' ', '');
    return this;
  }

  private setType(): FreezedFactoryBlock {
    if (this._node.kind === Kind.UNION_TYPE_DEFINITION) {
      this._typeName = camelCase(this._data.name.value);
    } else if (this._config.mergeInputs) {
      // reconstructs the pattern from the ObjectType name and the InputType name
      const objectTypeName = this._node.name.value;
      const inputTypeName = this._data.name.value;

      // split the InputType name with the ObjectType name to get the pattern
      const pattern = inputTypeName.split(objectTypeName).join('$');

      // if the pattern exists in the config, set it as the _typeName(namedConstructor)
      if (this._config.mergeInputs.includes(pattern)) {
        this._typeName = camelCase(pattern.split('$').join('_'));
      }
    }
    return this;
  }

  private setParameters(): FreezedFactoryBlock {
    if (this._node.kind !== Kind.UNION_TYPE_DEFINITION) {
      this._parameters = this._node.fields.map(
        (field: FieldDefinitionNode | InputValueDefinitionNode) => new FreezedParameterBlock(this._config, field)
      );
    }
    return this;
  }

  private setShape(): FreezedFactoryBlock {
    this._shape = this._parameters.map(p => this.toString()).join('');
    return this;
  }

  private setBlock(): FreezedFactoryBlock {
    let block = '';

    // decide if to use const or not

    // append the factory keyword and the name
    block += `factory ${this._name}`;

    // append .namedConstructor if _typeName is not null
    if (this._typeName !== null && this._typeName !== '') {
      block += `.${this._typeName} `;
    }

    // append the parenthesis for the constructor and braces for the named parameters
    block += '({\n';

    //append the shape
    block += indent(`${this._shape}\n`);

    // close the constructor
    block += '})';

    // store it in the shape
    this._block = block;
    return this;
  }

  /** returns the block */
  public toString(): string {
    if (this._block === null) {
      throw new Error('FreezedFactoryBlock: setShape must be called before calling toString()');
    }
    return this._block;
  }
}

export class FreezedParameterBlock {
  /** a list of decorators to copy paste to the generator */
  _decorators: string[] = [];

  /** default value */
  // _defaultValue?: string = null;

  /** mark the property as deprecated */
  // _deprecated?: boolean = null;

  /** mark the property as required */
  _required?: boolean = null;

  /** mark the property as required */
  // _type?: ParameterType = 'named';
  _type: string = null;

  /** the name of the property */
  _name: string = null;

  /** document the property */
  _comment = '';

  /** the shape is the content of the block */
  _shape: string = null;

  /** the block is the final structure that is generated */
  _block: string = null;

  constructor(private _config: FreezedPluginConfig, private _field: FieldType) {
    this._config = _config;
    this._field = _field;

    this.init();
  }

  private init(): void {
    this.setComment().setDecorators().setRequired().setType().setName().setShape().setBlock();
  }

  private setComment(): FreezedParameterBlock {
    const comment = this._field.description?.value;

    if (comment !== null && comment !== '') {
      this._comment = `/// ${this._comment}\n`;
    }

    return this;
  }

  private setDecorators(): FreezedParameterBlock {
    // TODO: Get decorators from field directives or config
    // const d = this._field.directives
    // const defaultDecorator = this._defaultValue !== null ? `@Default(${this._defaultValue})` : '';
    // const deprecatedDecorator = this._deprecated ? '@deprecated' : '';
    const jsonKeyNameDecorator = `@JsonKey(name: '${this._name}')`;
    // this._decorators = [...this._decorators, defaultDecorator, deprecatedDecorator, jsonKeyNameDecorator,]

    this._decorators = [jsonKeyNameDecorator];
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
    // TODO: name should be camelCased
    this._name = this._field.name.value;
    return this;
  }

  /** compose the freezed constructor property */
  private setShape(): FreezedParameterBlock {
    let shape = '';

    //append comment
    shape += `${this._comment}\n`;

    // append the decorators
    shape += this._decorators.map(d => `${d}\n`);

    // append required for non-nullable types
    shape += this._required ? ' required ' : '';

    // append the Dart Type
    shape += this._type;

    // append the name
    shape += this._name;

    // append a trailing comma and a newline
    shape += ',\n';
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
    if (this._config.customScalars?.[_scalar]) {
      return this._config.customScalars?.[_scalar];
    }
    if (DART_SCALARS[_scalar]) {
      return DART_SCALARS[_scalar];
    }
    return _scalar;
  }

  /** returns the block */
  public toString(): string {
    if (this._block === null) {
      throw new Error('FreezedParameterBlock: setShape must be called before calling toString()');
    }
    return this._block;
  }
}
