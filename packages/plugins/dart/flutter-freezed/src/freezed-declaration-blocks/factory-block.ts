import { indent } from '@graphql-codegen/visitor-plugin-common';
import { FieldDefinitionNode, InputValueDefinitionNode, Kind } from 'graphql';
import { camelCase, pascalCase } from 'change-case-all';
import { FreezedParameterBlock } from './parameter-block';
import { FreezedPluginConfig } from '../config';
import { FreezedConfigValue, NodeType } from '../utils';

export class FreezedFactoryBlock {
  /** document the constructor */
  _comment = '';

  /** a list of decorators to copy paste to the generator */
  // TODO:  handle this decorator @FreezedUnionValue('SpecialCase')
  // _decorators: string[] = [];

  /** mark the factory constrictor as deprecated */
  // _deprecated?: boolean = null;

  /** the key of the original type name */
  _key: string = null;

  /** the name of the class */
  _name: string = null;

  /** the namedConstructor is used for GraphQL Union types or if mergeInput is true */
  _namedConstructor?: string = null;

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

  private _freezedConfigValue: FreezedConfigValue;

  constructor(private _config: FreezedPluginConfig, private _node: NodeType) {
    this._config = _config;
    this._node = _node;
    this._freezedConfigValue = new FreezedConfigValue(_config, _node.name.value);
  }

  public init(): FreezedFactoryBlock {
    /*
      setName() and setType() will be called
      when the factory is retrieved from the repository
    */
    this.setComment().setParameters().setShape().setBlock();
    return this;
  }

  private setComment(): FreezedFactoryBlock {
    const comment = this._node.description?.value;

    if (comment && comment !== null && comment !== '') {
      this._comment = `/// ${comment} `;
    }
    return this;
  }

  setKey(key: string): FreezedFactoryBlock {
    this._key = pascalCase(key);
    return this;
  }

  setName(name: string): FreezedFactoryBlock {
    this._name = pascalCase(name);
    return this;
  }

  setNamedConstructor(namedConstructor: string = null): FreezedFactoryBlock {
    if (namedConstructor) {
      this._namedConstructor = camelCase(namedConstructor);
    }
    return this;
  }

  private setParameters(): FreezedFactoryBlock {
    if (this._node.kind !== Kind.UNION_TYPE_DEFINITION) {
      this._parameters = this._node.fields.map((field: FieldDefinitionNode | InputValueDefinitionNode) =>
        new FreezedParameterBlock(this._config, this._node, field).init()
      );
    }
    return this;
  }

  private setShape(): FreezedFactoryBlock {
    this._shape = this._parameters.map(p => p.toString()).join('');
    return this;
  }

  private setBlock(): FreezedFactoryBlock {
    let block = indent('');

    // decide if to use const or not
    if (this._freezedConfigValue.get('immutable')) {
      block += 'const ';
    }

    // append the factory keyword and the name
    block += `factory ${this._name}`;

    // append .namedConstructor is not null
    if (this._namedConstructor && this._namedConstructor !== '') {
      block += `.${this._namedConstructor}`;
    }

    // append the parenthesis for the constructor and braces for the named parameters
    block += '({\n';

    //append the shape
    block += this._shape;

    // close the constructor and assign the key
    block += indent(`}) = `);

    // but first decide whether prefix the key with an underscore
    if (this._namedConstructor === null) {
      block += '_';
    }

    // finally, append the key
    block += `${this._key};\n`;

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
