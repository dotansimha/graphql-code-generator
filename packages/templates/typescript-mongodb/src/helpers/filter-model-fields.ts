function filterModelFields(fieldsArray, options) {
  let result = '';
  const validFields = [];

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
