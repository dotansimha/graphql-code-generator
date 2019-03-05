import { AstNode } from 'graphql-codegen-core';

function filterModelFields(fieldsArray: AstNode[], options: Handlebars.HelperOptions) {
  let result = '';
  const validFields: AstNode[] = [];

  if (!fieldsArray) {
    throw new Error(`Invalid context for filterModelFields: ${JSON.stringify(fieldsArray)}`);
  }

  fieldsArray.forEach(gqlField => {
    if (
      gqlField.directives.id ||
      gqlField.directives.link ||
      gqlField.directives.column ||
      gqlField.directives.embedded
    ) {
      validFields.push(gqlField);
    }
  });

  validFields.forEach(field => {
    result += options.fn(field);
  });

  return result;
}

export default filterModelFields;
