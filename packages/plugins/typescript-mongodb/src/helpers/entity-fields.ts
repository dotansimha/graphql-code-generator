import { Field, Interface, Type } from 'graphql-codegen-core';
import { set } from 'lodash';
import { convertedType } from 'graphql-codegen-typescript-common';

// Directives fields
const ID_DIRECTIVE = 'id';
const ENTITY_DIRECTIVE = 'entity';
const ABSTRACT_ENTITY_DIRECTIVE = 'abstractEntity';
const LINK_DIRECTIVE = 'link';
const COLUMN_DIRECTIVE = 'column';
const EMBEDDED_DIRECTIVE = 'embedded';
const MAP_DIRECTIVE = 'map';

// Mapping
const ID_FIELD_NAME = '_id';
const ENUM_TYPE = 'string';
const ID_TYPE = 'ObjectID';

const appendField = convert => (
  obj: object,
  field: string,
  value: string,
  mapDirectiveValue: null | { path: string } = null
) => {
  if (mapDirectiveValue) {
    set(obj, mapDirectiveValue.path, value);
  } else {
    set(obj, field, value);
  }
};

type FieldsResult = { [name: string]: string | FieldsResult };

const buildFieldDef = convert => (type: string, field: Field, options: Handlebars.HelperOptions): string => {
  return convertedType(
    {
      ...field,
      type
    },
    options,
    convert,
    true
  );
};

function convertToInterfaceDefinition(type: Type | Interface, obj: FieldsResult, root = true): string {
  if (typeof obj === 'string') {
    return obj;
  }

  const result = Object.keys(obj).map(fieldName => {
    const fieldValue = obj[fieldName];

    return `${fieldName}: ${convertToInterfaceDefinition(type, fieldValue as FieldsResult, false)}`;
  });

  let appendExtensions = '';

  if (root && type['interfaces'] && type['interfaces'].length > 0) {
    const interfaces = type['interfaces'] as string[];

    appendExtensions = ` extends ${interfaces.map(n => `${n}DbInterface`).join(', ')} `;
  }

  return `${appendExtensions}{\n${result.join('\n')}\n}`;
}

export const entityFields = convert => (
  type: Type | Interface,
  options: Handlebars.HelperOptions,
  returnRaw = false
) => {
  if (type && (type.directives[ENTITY_DIRECTIVE] || type.directives[ABSTRACT_ENTITY_DIRECTIVE])) {
    const allFields = type.fields || [];
    const finalResult: FieldsResult = {};

    if (type.directives[ABSTRACT_ENTITY_DIRECTIVE] && type.directives[ABSTRACT_ENTITY_DIRECTIVE].discriminatorField) {
      appendField(convert)(finalResult, type.directives[ABSTRACT_ENTITY_DIRECTIVE].discriminatorField, 'string');
    }

    for (const field of allFields) {
      if (field.directives[ID_DIRECTIVE]) {
        appendField(convert)(
          finalResult,
          ID_FIELD_NAME,
          buildFieldDef(convert)(ID_TYPE, field, options),
          field.directives[MAP_DIRECTIVE]
        );
      } else if (field.directives[LINK_DIRECTIVE]) {
        appendField(convert)(
          finalResult,
          field.name,
          buildFieldDef(convert)(ID_TYPE, field, options),
          field.directives[MAP_DIRECTIVE]
        );
      } else if (field.directives[COLUMN_DIRECTIVE]) {
        if (field.isEnum) {
          appendField(convert)(
            finalResult,
            field.name,
            buildFieldDef(convert)(ENUM_TYPE, field, options),
            field.directives[MAP_DIRECTIVE]
          );
        } else {
          appendField(convert)(
            finalResult,
            field.directives[COLUMN_DIRECTIVE].name ? field.directives[COLUMN_DIRECTIVE].name : field.name,
            buildFieldDef(convert)(
              field.directives[COLUMN_DIRECTIVE].overrideType
                ? field.directives[COLUMN_DIRECTIVE].overrideType
                : field.type,
              field.directives[COLUMN_DIRECTIVE].overrideIsArray !== undefined
                ? {
                    ...field,
                    isArray: field.directives[COLUMN_DIRECTIVE].overrideIsArray,
                    dimensionOfArray: 1
                  }
                : field,
              options
            ),
            field.directives[MAP_DIRECTIVE]
          );
        }
      } else if (field.directives[EMBEDDED_DIRECTIVE]) {
        appendField(convert)(
          finalResult,
          field.name,
          buildFieldDef(convert)(`${field.type}DbObject`, field, options),
          field.directives[MAP_DIRECTIVE]
        );
      }
    }

    const additionalFields: [{ path: string; type: string }] =
      (type.directives[ENTITY_DIRECTIVE] && type.directives[ENTITY_DIRECTIVE].additionalFields) || [];

    if (additionalFields.length > 0) {
      for (const field of additionalFields) {
        appendField(convert)(finalResult, field.path, field.type);
      }
    }

    if (returnRaw) {
      return finalResult;
    }

    return convertToInterfaceDefinition(type, finalResult);
  }

  return '';
};
