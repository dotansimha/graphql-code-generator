import { transformComment } from '@graphql-codegen/visitor-plugin-common';
import { StringValueNode, NameNode } from 'graphql';

export type Access = 'private' | 'public' | 'protected';
export type Kind = 'class' | 'interface' | 'enum';

export class JavaDeclarationBlock {
  _name: string = null;
  _extendStr: string[] = [];
  _implementsStr: string[] = [];
  _kind: Kind = null;
  _access: Access = 'public';
  _final = false;
  _static = false;
  _block = null;
  _comment = null;
  _annotations: string[] = [];

  access(access: 'private' | 'public' | 'protected'): JavaDeclarationBlock {
    this._access = access;

    return this;
  }

  asKind(kind: Kind): JavaDeclarationBlock {
    this._kind = kind;

    return this;
  }

  final(): JavaDeclarationBlock {
    this._final = true;

    return this;
  }

  static(): JavaDeclarationBlock {
    this._static = true;

    return this;
  }

  annotate(annotations: string[]): JavaDeclarationBlock {
    this._annotations = annotations;

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

  implements(implementsStr: string[]): JavaDeclarationBlock {
    this._implementsStr = implementsStr;

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
      let implementsStr = '';
      let annotatesStr = '';
      const final = this._final ? ' final' : '';
      const isStatic = this._static ? ' static' : '';

      if (this._extendStr.length > 0) {
        extendStr = ` extends ${this._extendStr.join(', ')}`;
      }

      if (this._implementsStr.length > 0) {
        implementsStr = ` implements ${this._implementsStr.join(', ')}`;
      }

      if (this._annotations.length > 0) {
        annotatesStr = this._annotations.map(a => `@${a}`).join('\n') + '\n';
      }

      result += `${annotatesStr}${this._access}${isStatic}${final} ${this._kind} ${name}${extendStr}${implementsStr} `;
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
