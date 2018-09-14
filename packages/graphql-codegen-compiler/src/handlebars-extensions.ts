import { registerHelper, SafeString } from 'handlebars';
import * as Han from 'handlebars';
import { camelCase, pascalCase, snakeCase, titleCase } from 'change-case';
import { oneLineTrim } from 'common-tags';
import {
  SelectionSetFieldNode,
  Argument,
  Field,
  SchemaTemplateContext,
  SelectionSetFragmentSpread,
  Variable
} from 'graphql-codegen-core';
import { getFieldTypeAsString } from './field-type-to-string';
import { sanitizeFilename } from './sanitizie-filename';
import { FlattenModel, FlattenOperation } from './types';
import { flattenSelectionSet } from './flatten-types';
import { GeneratorConfig } from 'graphql-codegen-core';

export const initHelpers = (config: GeneratorConfig, schemaContext: SchemaTemplateContext) => {
  const customHelpers = config.customHelpers || {};

  Object.keys(customHelpers).forEach(helperName => {
    registerHelper(helperName, customHelpers[helperName] as any);
  });

  registerHelper('toPrimitive', function(type) {
    return config.primitives[type] || type || '';
  });

  registerHelper('stringify', function(obj) {
    return new SafeString(JSON.stringify(obj));
  });

  registerHelper('times', function(n, block) {
    let accum = '';

    for (let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }

    return accum;
  });

  registerHelper('ifDirective', function(
    context: any,
    directiveName: string,
    options: { inverse: Function; fn: Function; data: { root: any } }
  ) {
    if (context && context['directives'] && directiveName && typeof directiveName === 'string') {
      const directives = context['directives'];
      const directiveValue = directives[directiveName];

      if (directiveValue) {
        return options && options.fn ? options.fn({ ...(directiveValue || {}), ...context }) : '';
      } else {
        return options && options.inverse ? options.inverse(context) : '';
      }
    }

    return options && options.inverse ? options.inverse(context) : '';
  });

  registerHelper('unlessDirective', function(
    context: any,
    directiveName: string,
    options: { inverse: Function; fn: Function; data: { root: any } }
  ) {
    if (context && context['directives'] && directiveName && typeof directiveName === 'string') {
      const directives = context['directives'];
      const directiveValue = directives[directiveName];

      if (!directiveValue) {
        return options && options.fn ? options.fn({ ...(directiveValue || {}), ...context }) : '';
      } else {
        return options && options.inverse ? options.inverse(context) : '';
      }
    }

    return options && options.inverse ? options.inverse(context) : '';
  });

  registerHelper('toComment', function(str) {
    if (!str || str === '') {
      return '';
    }

    return new SafeString('/** ' + oneLineTrim`${str || ''}` + ' */');
  });

  registerHelper('eachImport', function(context: any, options: { fn: Function }) {
    let ret = '';
    const imports: { name: string; file: string; type: string }[] = [];

    // Interface, input types, types
    if (context.fields && !context.onType && !context.operationType) {
      context.fields.forEach((field: Field) => {
        if (!config.primitives[field.type]) {
          if (field.type === context.name) {
            return;
          }

          const fieldType = getFieldTypeAsString(field);
          const file = sanitizeFilename(field.type, fieldType);

          if (!imports.find(t => t.name === field.type)) {
            imports.push({ name: field.type, file, type: fieldType });
          }
        }

        // Fields arguments
        if (field.arguments && field.hasArguments) {
          field.arguments.forEach((arg: Argument) => {
            if (!config.primitives[arg.type]) {
              const fieldType = getFieldTypeAsString(arg);
              const file = sanitizeFilename(arg.type, fieldType);

              if (!imports.find(t => t.name === arg.type)) {
                imports.push({ name: arg.type, file, type: fieldType });
              }
            }
          });
        }
      });
    }

    // Types that uses interfaces
    if (context.interfaces) {
      context.interfaces.forEach((infName: string) => {
        const file = sanitizeFilename(infName, 'interface');

        if (!imports.find(t => t.name === infName)) {
          imports.push({ name: infName, file, type: 'interface' });
        }
      });
    }

    // Unions
    if (context.possibleTypes) {
      context.possibleTypes.forEach((possibleType: string) => {
        const file = sanitizeFilename(possibleType, 'type');

        if (!imports.find(t => t.name === possibleType)) {
          imports.push({ name: possibleType, file, type: 'type' });
        }
      });
    }

    if (context.variables) {
      context.variables.forEach((variable: Variable) => {
        if (!config.primitives[variable.type]) {
          const fieldType = getFieldTypeAsString(variable);
          const file = sanitizeFilename(variable.type, fieldType);

          if (!imports.find(t => t.name === variable.type)) {
            imports.push({ name: variable.type, file, type: fieldType });
          }
        }
      });
    }

    // Operations and Fragments
    if (context.selectionSet) {
      const flattenDocument: FlattenOperation = context.isFlatten ? context : flattenSelectionSet(context);

      flattenDocument.fragmentsSpread.forEach(fragmentSpread => {
        const file = sanitizeFilename(fragmentSpread.fragmentName, 'fragment');

        if (!imports.find(t => t.name === fragmentSpread.fragmentName)) {
          imports.push({ name: fragmentSpread.fragmentName, file, type: 'fragment' });
        }
      });

      flattenDocument.innerModels.forEach((innerModel: FlattenModel) => {
        if (innerModel.fragmentsSpread && innerModel.fragmentsSpread.length > 0) {
          innerModel.fragmentsSpread.forEach((fragmentSpread: SelectionSetFragmentSpread) => {
            const file = sanitizeFilename(fragmentSpread.fragmentName, 'fragment');

            if (!imports.find(t => t.name === fragmentSpread.fragmentName)) {
              imports.push({ name: fragmentSpread.fragmentName, file, type: 'fragment' });
            }
          });
        }

        innerModel.fields.forEach((field: SelectionSetFieldNode) => {
          if (!config.primitives[field.type]) {
            let type = null;

            if (field.isEnum) {
              type = 'enum';
            } else if (field.isInputType) {
              type = 'input-type';
            } else if (field.isScalar) {
              type = 'scalar';
            }

            if (type !== null) {
              const file = sanitizeFilename(field.type, type);

              if (!imports.find(t => t.name === field.type)) {
                imports.push({ name: field.type, file, type });
              }
            }
          }
        });
      });
    }

    for (let i = 0, j = imports.length; i < j; i++) {
      ret =
        ret +
        options.fn(imports[i], {
          data: {
            withExtension: imports[i] + '.' + config.filesExtension
          }
        });
    }

    return ret;
  });

  registerHelper('toLowerCase', function(str) {
    return (str || '').toLowerCase();
  });

  registerHelper('toUpperCase', function(str) {
    return (str || '').toUpperCase();
  });

  registerHelper('toPascalCase', function(str: string) {
    if (str.charAt(0) === '_') {
      return '_' + pascalCase(str || '');
    }

    return pascalCase(str || '');
  });

  registerHelper('toSnakeCase', function(str: string) {
    return snakeCase(str || '');
  });

  registerHelper('toTitleCase', function(str) {
    return titleCase(str || '');
  });

  registerHelper('toCamelCase', function(str) {
    return camelCase(str || '');
  });

  registerHelper('multilineString', function(str) {
    if (!str) {
      return '';
    }

    const lines = str.split('\n');

    return lines
      .map((line, index) => {
        const isLastLine = index !== lines.length - 1;

        return `"${line.replace(/"/g, '\\"')}"` + (isLastLine ? ' +' : '');
      })
      .join('\r\n');
  });

  registerHelper('for', function(from, to, incr, block) {
    let accum = '';

    for (let i = from; i < to; i += incr) {
      accum += block.fn(i);
    }

    return accum;
  });

  registerHelper('ifCond', function(v1: any, operator: string, v2: any, options) {
    switch (operator) {
      case '==':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '!=':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case '!==':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case '<':
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case '<=':
        return v1 <= v2 ? options.fn(this) : options.inverse(this);
      case '>':
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case '>=':
        return v1 >= v2 ? options.fn(this) : options.inverse(this);
      case '&&':
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case '||':
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  registerHelper('withGql', (type: string, name: string, options) => {
    if (!type || !name) {
      throw new Error(`Both type and name are required for withGql helper!`);
    }

    type = camelCase(type);

    const sourceArr = schemaContext[type] || schemaContext[type + 's'];

    if (!sourceArr) {
      throw new Error(`Type ${type} is not a valid SchemaTemplateContext field!`);
    }

    const item = sourceArr.find(item => item.name === name);

    if (!item) {
      throw new Error(`GraphQL object with name ${name} and type ${type} cannot be found!`);
    }

    return options.fn(item);
  });
};
