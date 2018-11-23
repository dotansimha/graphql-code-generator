export function block(array) {
  return array && array.length !== 0 ? '{\n' + array.join('\n') + '\n}' : '';
}

export function wrapWithSingleQuotes(str: string): string {
  return `'${str}'`;
}

export function breakLine(str: string): string {
  return str + '\n';
}

export function indent(str: string): string {
  return '  ' + str;
}

export class DeclarationBlock {
  _export = false;
  _name = null;
  _kind = null;
  _content = null;
  _block = null;

  export(exp = true): DeclarationBlock {
    this._export = exp;

    return this;
  }

  asKind(kind): DeclarationBlock {
    this._kind = kind;

    return this;
  }

  withBlock(block: string): DeclarationBlock {
    this._block = block;

    return this;
  }

  withContent(content: string): DeclarationBlock {
    this._content = content;

    return this;
  }

  withName(name: string): DeclarationBlock {
    this._name = name;

    return this;
  }

  public get string(): string {
    let result = '';

    if (this._export) {
      result += 'export ';
    }

    if (this._kind) {
      let extra = '';
      let name = '';

      if (['type', 'const', 'var', 'let'].includes(this._kind)) {
        extra = '= ';
      }

      if (this._name) {
        name = this._name + ' ';
      }

      result += this._kind + ' ' + name + extra;
    }

    if (this._block) {
      result += `{
${this._block}
}`;
    } else if (this._content) {
      result += this._content;
    } else if (this._kind) {
      result += '{}';
    }

    return result + ';\n';
  }
}
