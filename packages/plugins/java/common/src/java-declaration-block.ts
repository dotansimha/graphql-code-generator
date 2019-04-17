import { transformComment } from '@graphql-codegen/visitor-plugin-common';
import { StringValueNode, NameNode } from 'graphql';

export type Access = 'private' | 'public' | 'protected';
export type Kind = 'class' | 'interface';

export class JavaDeclarationBlock {
  _name: string = null;
  _extendStr: string[] = [];
  _kind: Kind = null;
  _access: Access = 'public';
  _block = null;
  _comment = null;

  access(access: 'private' | 'public' | 'protected'): JavaDeclarationBlock {
    this._access = access;

    return this;
  }

  asKind(kind: Kind): JavaDeclarationBlock {
    this._kind = kind;

    return this;
  }

  withComment(comment: string | StringValueNode | null): JavaDeclarationBlock {
    if (comment) {
      this._comment = transformComment(comment, 0);
    }

    return this;
  }

  withBlock(block: string): JavaDeclarationBlock {
    this._block = block;

    return this;
  }

  extends(extendStr: string[]): JavaDeclarationBlock {
    this._extendStr = extendStr;

    return this;
  }

  withName(name: string | NameNode): JavaDeclarationBlock {
    this._name = typeof name === 'object' ? (name as NameNode).value : name;

    return this;
  }

  public get string(): string {
    let result = '';

    if (this._kind) {
      let name = '';

      if (this._name) {
        name = this._name;
      }

      let extendStr = '';

      if (this._extendStr.length > 0) {
        extendStr = ` extends ${this._extendStr.join(', ')}`;
      }

      result += `${this._access} ${this._kind} ${name}${extendStr} `;
    }

    if (this._block) {
      const before = '{';
      const after = '}';
      const block = [before, this._block, after].join('\n');
      result += block;
    } else {
      result += '{}';
    }

    return (this._comment ? this._comment : '') + result + '\n';
  }
}
