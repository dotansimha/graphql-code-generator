import { set } from 'lodash';
import { indent } from 'graphql-codegen-visitor-plugin-common';

type FieldsResult = { [name: string]: string | FieldsResult };

export class FieldsTree {
  private _fields: FieldsResult = {};

  addField(path: string, type: string): void {
    set(this._fields, path, type);
  }

  private _getInnerField(root: FieldsResult, level = 1): string {
    if (typeof root === 'string') {
      return root;
    }

    const fields = Object.keys(root).map(fieldName => {
      const fieldValue = root[fieldName];

      return indent(`${fieldName}: ${this._getInnerField(fieldValue as FieldsResult, level + 1)},`, level);
    });

    return level === 1
      ? fields.join('\n')
      : `{
${fields.join('\n')}
${indent('}', level - 1)}`;
  }

  get string(): string {
    return this._getInnerField(this._fields);
  }
}
