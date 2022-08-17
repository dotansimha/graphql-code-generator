import { indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { StringValueNode, NameNode } from 'graphql';
import { transformComment } from './utils.js';

export type Access = 'private' | 'public' | 'protected';
export type Kind = 'namespace' | 'class' | 'record' | 'interface' | 'enum';

export class CSharpDeclarationBlock {
  _name: string = null;
  _extendStr: string[] = [];
  _implementsStr: string[] = [];
  _kind: Kind = null;
  _access: Access = 'public';
  _final = false;
  _static = false;
  _block = null;
  _comment = null;
  _nestedClasses: CSharpDeclarationBlock[] = [];

  nestedClass(nstCls: CSharpDeclarationBlock): CSharpDeclarationBlock {
    this._nestedClasses.push(nstCls);

    return this;
  }

  access(access: Access): CSharpDeclarationBlock {
    this._access = access;

    return this;
  }

  asKind(kind: Kind): CSharpDeclarationBlock {
    this._kind = kind;

    return this;
  }

  final(): CSharpDeclarationBlock {
    this._final = true;

    return this;
  }

  static(): CSharpDeclarationBlock {
    this._static = true;

    return this;
  }

  withComment(comment: string | StringValueNode | null): CSharpDeclarationBlock {
    if (comment) {
      this._comment = transformComment(comment, 1);
    }

    return this;
  }

  withBlock(block: string): CSharpDeclarationBlock {
    this._block = block;

    return this;
  }

  extends(extendStr: string[]): CSharpDeclarationBlock {
    this._extendStr = extendStr;

    return this;
  }

  implements(implementsStr: string[]): CSharpDeclarationBlock {
    this._implementsStr = implementsStr;

    return this;
  }

  withName(name: string | NameNode): CSharpDeclarationBlock {
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

      if (this._kind === 'namespace') {
        result += `${this._kind} ${name} `;
      } else {
        let extendStr = '';
        let implementsStr = '';
        const final = this._final ? ' final' : '';
        const isStatic = this._static ? ' static' : '';

        if (this._extendStr.length > 0) {
          extendStr = ` : ${this._extendStr.join(', ')}`;
        }

        if (this._implementsStr.length > 0) {
          implementsStr = ` : ${this._implementsStr.join(', ')}`;
        }

        result += `${this._access}${isStatic}${final} ${this._kind} ${name}${extendStr}${implementsStr} `;
      }
    }

    const nestedClasses = this._nestedClasses.length
      ? this._nestedClasses.map(c => indentMultiline(c.string)).join('\n\n')
      : null;
    const before = '{';
    const after = '}';
    const block = [before, nestedClasses, this._block, after].filter(f => f).join('\n');
    result += block;

    return (this._comment ? this._comment : '') + result + '\n';
  }
}
