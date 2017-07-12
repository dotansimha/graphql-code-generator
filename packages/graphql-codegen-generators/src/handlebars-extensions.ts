import { registerHelper } from 'handlebars';
import { camelCase, pascalCase, snakeCase, titleCase } from 'change-case';
import { oneLineTrim } from 'common-tags';
import { Argument, Field, SchemaTemplateContext, SelectionSetFragmentSpread } from 'graphql-codegen-core';
import { getFieldTypeAsString } from './field-type-to-string';
import { sanitizeFilename } from './sanitizie-filename';
import { FlattenModel, FlattenOperation, GeneratorConfig } from './types';
import { flattenSelectionSet } from './flatten-types';

export const initHelpers = (config: GeneratorConfig, schemaContext: SchemaTemplateContext) => {
  registerHelper('toPrimitive', function (type) {
    return config.primitives[type] || type || '';
  });

  registerHelper('times', function (n, block) {
    let accum = '';

    for (let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }

    return accum;
  });

  registerHelper('toComment', function (str) {
    if (!str || str === '') {
      return '';
    }

    return '/* ' + oneLineTrim`${str || ''}` + ' */';
  });

  registerHelper('eachImport', function (context: any, options: { fn: Function }) {
    let ret = '';
    const imports: { name: string; file: string; }[] = [];

    // Interface, input types, types
    if (context.fields) {
      context.fields.forEach((field: Field) => {
        if (!config.primitives[field.type]) {
          const fieldType = getFieldTypeAsString(field);
          const file = sanitizeFilename(field.type, fieldType) + '.' + config.filesExtension;

          if (!imports.find(t => t.name === field.type)) {
            imports.push({ name: field.type, file });
          }

          // Fields arguments
          if (field.arguments && field.arguments.length > 0) {
            field.arguments.forEach((arg: Argument) => {
              if (!config.primitives[arg.type]) {
                const fieldType = getFieldTypeAsString(arg);
                const file = sanitizeFilename(arg.type, fieldType) + '.' + config.filesExtension;

                if (!imports.find(t => t.name === arg.type)) {
                  imports.push({ name: arg.type, file });
                }
              }
            });
          }
        }
      });
    }

    // Types that uses interfaces
    if (context.interfaces) {
      context.interfaces.forEach((infName: string) => {
        const file = sanitizeFilename(infName, 'interface') + '.' + config.filesExtension;

        if (!imports.find(t => t.name === infName)) {
          imports.push({ name: infName, file });
        }
      });
    }

    // Unions
    if (context.possibleTypes) {
      context.possibleTypes.forEach((possibleType: string) => {
        const file = sanitizeFilename(possibleType, 'type') + '.' + config.filesExtension;

        if (!imports.find(t => t.name === possibleType)) {
          imports.push({ name: possibleType, file });
        }
      });
    }

    // Operations and Fragments
    if (context.selectionSet) {
      const flattenDocument: FlattenOperation = context.isFlatten ? context : flattenSelectionSet(context);
      flattenDocument.innerModels.forEach((innerModel: FlattenModel) => {
        if (innerModel.fragmentsSpread && innerModel.fragmentsSpread.length > 0) {
          innerModel.fragmentsSpread.forEach((fragmentSpread: SelectionSetFragmentSpread) => {
            const file = sanitizeFilename(fragmentSpread.fragmentName, 'fragment') + '.' + config.filesExtension;

            if (!imports.find(t => t.name === fragmentSpread.fragmentName)) {
              imports.push({ name: fragmentSpread.fragmentName, file });
            }
          });
        }

        const schemaType = innerModel.schemaBaseType;
        const inputType = schemaContext.inputTypes.find(inputType => inputType.name === schemaType);

        if (inputType) {
          const file = sanitizeFilename(inputType.name, 'input-type') + '.' + config.filesExtension;

          if (!imports.find(t => t.name === inputType.name)) {
            imports.push({ name: inputType.name, file });
          }

          return;
        }

        const enumType = schemaContext.enums.find(enumType => enumType.name === schemaType);

        if (enumType) {
          const file = sanitizeFilename(enumType.name, 'enum') + '.' + config.filesExtension;

          if (!imports.find(t => t.name === enumType.name)) {
            imports.push({ name: enumType.name, file });
          }

          return;
        }

        const scalarType = schemaContext.scalars.find(scalarType => scalarType.name === schemaType);

        if (scalarType) {
          const file = sanitizeFilename(scalarType.name, 'scalar') + '.' + config.filesExtension;

          if (!imports.find(t => t.name === scalarType.name)) {
            imports.push({ name: scalarType.name, file });
          }

          return;
        }
      });


    }

    for (let i = 0, j = imports.length; i < j; i++) {
      ret = ret + options.fn(imports[i]);
    }

    return ret;
  });

  registerHelper('toLowerCase', function (str) {
    return (str || '').toLowerCase();
  });

  registerHelper('toUpperCase', function (str) {
    return (str || '').toUpperCase();
  });

  registerHelper('toPascalCase', function (str) {
    return pascalCase(str || '');
  });

  registerHelper('toSnakeCase', function (str) {
    return snakeCase(str || '');
  });

  registerHelper('toTitleCase', function (str) {
    return titleCase(str || '');
  });

  registerHelper('toCamelCqse', function (str) {
    return camelCase(str || '');
  });

  registerHelper('for', function (from, to, incr, block) {
    let accum = '';

    for (let i = from; i < to; i += incr) {
      accum += block.fn(i);
    }

    return accum;
  });

  registerHelper('limitedEach', function (context, block) {
    let ret = '';
    let count = parseInt(block.hash.count);

    for (let i = 0, j = count; i < j; i++) {
      ret = ret + block.fn(context[i], {
        data: {
          last: i === count - 1,
          first: i === 0,
          index: 1
        }
      });
    }

    return ret;
  });
};