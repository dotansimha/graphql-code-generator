import { indent } from '@graphql-codegen/visitor-plugin-common';
import {
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { camelCase, pascalCase } from 'change-case-all';
import { FreezedPluginConfig } from '../config';
import {
  getCustomDecorators,
  transformCustomDecorators,
  FreezedConfigValue,
  FreezedFactoryBlockRepository,
} from '../utils';
import { FreezedFactoryBlock } from './factory-block';

export type NodeType = ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode | UnionTypeDefinitionNode;

export class FreezedDeclarationBlock {
  /** document the class  */
  _comment = '';

  /** a list of decorators to copy paste to the generator */
  _decorators: string[] = [];

  /** the name of the class */
  _name: string = null;

  /** a list of default constructor and named Constructors used create a Freezed union/sealed class */
  _factoryBlocks: FreezedFactoryBlock[] = [];

  /** the shape is the content of the block */
  _shape: string = null;

  /** the block is the final structure that is generated */
  _block: string = null;
  private _freezedConfigValue: FreezedConfigValue;

  constructor(
    private _config: FreezedPluginConfig,
    private _freezedFactoryBlockRepository: FreezedFactoryBlockRepository,
    private _node: NodeType
  ) {
    this._config = _config;
    this._freezedFactoryBlockRepository = _freezedFactoryBlockRepository;
    this._node = _node;
  }

  public init(): FreezedDeclarationBlock {
    this._freezedConfigValue = new FreezedConfigValue(this._config, this._node.name.value);
    this.setComment().setDecorators().setName().setFactoryBlocks().setShape().setBlock();
    return this;
  }

  private setComment(): FreezedDeclarationBlock {
    const comment = this._node.description?.value;

    if (comment && comment !== null && comment !== '') {
      this._comment = `/// ${comment} \n`;
    }

    return this;
  }

  private setDecorators(): FreezedDeclarationBlock {
    this._decorators = [
      this.getFreezedDecorator(),
      ...transformCustomDecorators(getCustomDecorators(this._config, ['class'], this._node.name.value), this._node),
    ];
    return this;
  }

  private getFreezedDecorator() {
    const use_unfreezed = () => {
      if (this._node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && this._freezedConfigValue.get('mutableInputs')) {
        return '@unfreezed';
      }
      return use_Freezed_or_freezed();
    };

    const use_Freezed_or_freezed = () => {
      if (this._freezedConfigValue.get('immutable')) {
        // if any of these options is not null, use the @Freezed() decorator passing in that option
        const copyWith = this._freezedConfigValue.get('copyWith');
        const equal = this._freezedConfigValue.get('equal');
        const makeCollectionsUnmodifiable = this._freezedConfigValue.get('makeCollectionsUnmodifiable');
        const unionKey = this._freezedConfigValue.get('unionKey');
        const unionValueCase = this._freezedConfigValue.get('unionValueCase');
        if (copyWith || equal || makeCollectionsUnmodifiable || unionKey || unionValueCase) {
          return `@Freezed(\n
          ${copyWith ? indent(`copyWith: ${copyWith},\n`) : ''}
          ${equal ? indent(`equal: ${equal},\n`) : ''}
          ${makeCollectionsUnmodifiable ? indent(`makeCollectionsUnmodifiable: ${makeCollectionsUnmodifiable},\n`) : ''}
          ${unionKey ? indent(`unionKey: ${unionKey},\n`) : ''}
          ${unionValueCase ? indent(`unionValueCase: ${unionValueCase},\n`) : ''}
        )`;
        }
        // else fallback to the normal @freezed decorator
        return '@freezed';
      }
      // if not immutable, fallback to @unfreezed
      return '@unfreezed';
    };

    // this is the start of the pipeline of decisions to determine which Freezed decorator to use
    return use_unfreezed();
  }

  private setName(): FreezedDeclarationBlock {
    this._name = pascalCase(this._node.name.value);
    return this;
  }

  private setFactoryBlocks(): FreezedDeclarationBlock {
    if (this._node.kind === Kind.UNION_TYPE_DEFINITION) {
      this._factoryBlocks = this._node.types?.map((_type: NamedTypeNode) =>
        new FreezedFactoryBlock(this._config, this._node).init()
      );
    } else {
      /*
        for `ObjectTypeDefinitionNode` and `InputObjectTypeDefinitionNode` nodes,
        we use the `ShapeRepository`
        to register the `FreezedFactoryBlock` so that we can use it later
        when we are merging inputs or generating freezed union/sealed classes
        for GraphQL union types
      */
      this._factoryBlocks = this._node.fields?.map((_field: FieldDefinitionNode | InputValueDefinitionNode) =>
        this._freezedFactoryBlockRepository.register(
          this._node.name.value,
          new FreezedFactoryBlock(this._config, this._node).init()
        )
      );
    }
    return this;
  }

  private setShape(): FreezedDeclarationBlock {
    let shape = '';
    // some helper variables
    const name = this._node.name.value;
    let namedConstructor: string = null;
    let factoryBlockKey: string = null;

    // append private empty constructor
    if (this._freezedConfigValue.get('privateEmptyConstructor')) {
      shape += indent(`const ${this._name}._();\n\n`);
    }

    // decide whether to append an empty Union constructor
    if (this._freezedConfigValue.get('defaultUnionConstructor') && this._node.kind === Kind.UNION_TYPE_DEFINITION) {
      shape += indent(`const factory ${this._name}() = _${this._name};\n\n`);
    }

    // append tokens which will be used to retrieve the factory blocks
    // from the FreezedFactoryBlockRepository
    if (this._node.kind === Kind.UNION_TYPE_DEFINITION) {
      this._node.types.forEach(type => {
        namedConstructor = type.name.value;
        factoryBlockKey = namedConstructor;
        shape += `==>factory==>${factoryBlockKey}==>${'union_factory'}==>${name}==>${namedConstructor}\n`;
      });
    } else {
      factoryBlockKey = name;
      // replace token for the ObjectType & InputType to be replaced with the default Freezed constructor
      shape += `==>factory==>${factoryBlockKey}==>${'class_factory'}==>${name}\n`;

      const mergeInputs = this._freezedConfigValue.get('mergeInputs') as string[];

      if (this._node.kind === Kind.OBJECT_TYPE_DEFINITION && mergeInputs) {
        // replace token for the InputTypes(a.k.a namedConstructors) as a union/sealed class
        mergeInputs.forEach(input => {
          namedConstructor = camelCase(input.split('$').join('_'));
          factoryBlockKey = input.replace('$', name);
          shape += `==>factory==>${factoryBlockKey}==>${'union_factory'}==>${name}==>${namedConstructor}\n`;
        });
      }
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
    block += this._comment;

    // append the decorators
    block += this._decorators.join('\n');

    if (this._decorators !== []) {
      block += '\n';
    }

    // append start of class definition
    block += `class ${this._name} with _$${this._name} {\n`;

    // append the shape
    block += this._shape;

    // append fromJson
    if (this._freezedConfigValue.get('fromJsonToJson')) {
      block += indent(`factory ${this._name}.fromJson(Map<String, Object?> json) => _${this._name}FromJson(json);\n`);
    }

    //append end of class definition
    block += '}\n\n';

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
