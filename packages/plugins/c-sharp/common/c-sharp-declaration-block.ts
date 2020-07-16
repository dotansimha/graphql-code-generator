import { indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { StringValueNode, NameNode } from 'graphql';
import { transformComment } from './utils';
const stripIndent = require('strip-indent');

export type Access = 'private' | 'public' | 'protected';
export type Kind = 'namespace' | 'class' | 'interface' | 'enum';
export type MemberFlags = { transient?: boolean; final?: boolean; volatile?: boolean; static?: boolean };
export type ClassMember = {
  value: string;
  name: string;
  access: Access;
  type: string;
  annotations: string[];
  flags: MemberFlags;
};
export type ClassMethod = {
  methodAnnotations: string[];
  args: Partial<ClassMember>[];
  implementation: string;
  name: string;
  access: Access;
  returnType: string | null;
  returnTypeAnnotations: string[];
  flags: MemberFlags;
};

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
  _annotations: string[] = [];
  _members: ClassMember[] = [];
  _methods: ClassMethod[] = [];
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

  annotate(annotations: string[]): CSharpDeclarationBlock {
    this._annotations = annotations;

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

  private printMember(member: Partial<ClassMember>): string {
    const flags = member.flags || {};

    const pieces = [
      member.access,
      flags.static ? 'static' : null,
      flags.final ? 'final' : null,
      flags.transient ? 'transient' : null,
      flags.volatile ? 'volatile' : null,
      ...(member.annotations || []).map(annotation => `@${annotation}`),
      member.type,
      member.name,
    ].filter(f => f);

    return pieces.join(' ') + (member.value ? ` = ${member.value}` : '');
  }

  private printMethod(method: ClassMethod): string {
    const pieces = [
      ...method.methodAnnotations.map(a => `@${a}\n`),
      method.access,
      method.flags.static ? 'static' : null,
      method.flags.final ? 'final' : null,
      method.flags.transient ? 'transient' : null,
      method.flags.volatile ? 'volatile' : null,
      ...(method.returnTypeAnnotations || []).map(annotation => `@${annotation}`),
      method.returnType,
      method.name,
    ].filter(f => f);

    const args = method.args.map(arg => this.printMember(arg)).join(', ');

    return `${pieces.join(' ')}(${args}) {
${indentMultiline(method.implementation)}
}`;
  }

  addClassMember(
    name: string,
    type: string,
    value: string,
    typeAnnotations: string[] = [],
    access: Access = null,
    flags: MemberFlags = {}
  ): CSharpDeclarationBlock {
    this._members.push({
      name,
      type,
      value,
      annotations: typeAnnotations,
      access,
      flags: {
        final: false,
        transient: false,
        volatile: false,
        static: false,
        ...flags,
      },
    });

    return this;
  }

  addClassMethod(
    name: string,
    returnType: string | null,
    impl: string,
    args: Partial<ClassMember>[] = [],
    returnTypeAnnotations: string[] = [],
    access: Access = null,
    flags: MemberFlags = {},
    methodAnnotations: string[] = []
  ): CSharpDeclarationBlock {
    this._methods.push({
      name,
      returnType,
      implementation: impl,
      args,
      returnTypeAnnotations,
      access,
      flags: {
        final: false,
        transient: false,
        volatile: false,
        static: false,
        ...flags,
      },
      methodAnnotations: methodAnnotations || [],
    });

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
        let annotatesStr = '';
        const final = this._final ? ' final' : '';
        const isStatic = this._static ? ' static' : '';

        if (this._extendStr.length > 0) {
          extendStr = ` : ${this._extendStr.join(', ')}`;
        }

        if (this._implementsStr.length > 0) {
          implementsStr = ` : ${this._implementsStr.join(', ')}`;
        }

        if (this._annotations.length > 0) {
          annotatesStr = this._annotations.map(a => `@${a}`).join('\n') + '\n';
        }

        result += `${annotatesStr}${this._access}${isStatic}${final} ${this._kind} ${name}${extendStr}${implementsStr} `;
      }
    }

    const members = this._members.length
      ? indentMultiline(stripIndent(this._members.map(member => this.printMember(member) + ';').join('\n')))
      : null;
    const methods = this._methods.length
      ? indentMultiline(stripIndent(this._methods.map(method => this.printMethod(method)).join('\n\n')))
      : null;
    const nestedClasses = this._nestedClasses.length
      ? this._nestedClasses.map(c => indentMultiline(c.string)).join('\n\n')
      : null;
    const before = '{';
    const after = '}';
    const block = [before, members, methods, nestedClasses, this._block, after].filter(f => f).join('\n');
    result += block;

    return (this._comment ? this._comment : '') + result + '\n';
  }
}
