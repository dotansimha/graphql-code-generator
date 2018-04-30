import * as Handlebars from 'handlebars';

const map = {
  String: 'String',
  Boolean: 'Boolean',
  Int: 'Number',
  Float: 'Number',
  ID: 'Mongoose.Schema.Types.ObjectId'
};

function toMongooseType(field) {
  if (field && field !== '') {
    if (!field.directives) {
      throw new Error(`Invalid context for toMongooseType: ${JSON.stringify(field)}`);
    }
    let result = field.type;

    if (field.directives.column && field.directives.column.overrideType) {
      result = field.directives.column.overrideType;

      if (result.includes('[')) {
        result = result.replace('[', '').replace(']', '');
      }

      if (result.toLowerCase() === 'objectid') {
        result = 'Mongoose.Schema.Types.ObjectId';
      }

      if (field.directives.column.ref) {
        result = `${result}, ref: '${field.directives.column.ref}'`;
      }
    } else if (map[result]) {
      result = map[result];
    } else if (field.isEnum) {
      result = 'String';
    } else if (field.directives.link) {
      const tType = 'Mongoose.Schema.Types.ObjectId';

      if (field.isUnion) {
        result = `{ kind: String, item: { type: Mongoose.Schema.Types.ObjectId, refPath: '${field.name}.kind' } }`;
      } else {
        result = `${tType}, ref: '${field.type}'`;
      }
    }

    if (field.isArray && !field.directives.link) {
      result = `[${result}]`;
    }

    return new Handlebars.SafeString(result);
  }

  return '';
}

export default toMongooseType;
