import {
  visit,
  DocumentNode,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  Kind,
  TypeDefinitionNode,
  TypeExtensionNode,
  EnumTypeDefinitionNode,
  EnumTypeExtensionNode,
  InputObjectTypeDefinitionNode,
  InputObjectTypeExtensionNode,
} from 'graphql';
import {
  collectUsedTypes,
  unique,
  withQuotes,
  indent,
  pushUnique,
  concatByKey,
  uniqueByKey,
  createObject,
} from './utils';

// TODO: consider options of other plugins (naming convention etc)

type RegistryKeys = 'objects' | 'inputs' | 'interfaces' | 'scalars' | 'unions' | 'enums';
type Registry = Record<RegistryKeys, string[]>;
const registryKeys: RegistryKeys[] = ['objects', 'inputs', 'interfaces', 'scalars', 'unions', 'enums'];
const resolverKeys: Array<Extract<RegistryKeys, 'objects' | 'enums' | 'scalars' | 'unions'>> = [
  'scalars',
  'objects',
  'enums',
  'unions',
];

// Unfortunately it's static... for now
const ROOT_TYPES = ['Query', 'Mutation', 'Subscription'];

export function buildModule(
  doc: DocumentNode,
  {
    importNamespace,
    importPath,
  }: {
    importNamespace: string;
    importPath: string;
  }
) {
  const picks: Record<RegistryKeys, Record<string, string[]>> = createObject(registryKeys, () => ({}));
  const defined: Registry = createObject(registryKeys, () => []);
  const extended: Registry = createObject(registryKeys, () => []);

  // List of types used in objects, fields, arguments etc
  const usedTypes = collectUsedTypes(doc);

  visit(doc, {
    ObjectTypeDefinition(node) {
      collectTypeDefinition(node);
    },
    ObjectTypeExtension(node) {
      collectTypeExtension(node);
    },
    InputObjectTypeDefinition(node) {
      collectTypeDefinition(node);
    },
    InputObjectTypeExtension(node) {
      collectTypeExtension(node);
    },
    // InterfaceTypeDefinition(node) {
    //   collectTypeDefinition(node);
    // },
    // InterfaceTypeExtension(node) {
    //   collectTypeExtension(node);
    // },
    ScalarTypeDefinition(node) {
      collectTypeDefinition(node);
    },
    // UnionTypeDefinition(node) {
    //   collectTypeDefinition(node);
    // },
    // UnionTypeExtension(node) {
    //   collectTypeExtension(node);
    // },
    EnumTypeDefinition(node) {
      collectTypeDefinition(node);
    },
    EnumTypeExtension(node) {
      collectTypeExtension(node);
    },
  });

  // Defined and Extended types
  const visited: Registry = createObject(registryKeys, key => concatByKey(defined, extended, key));

  // Types that are not defined or extended in a module, they come from other modules
  const external: Registry = createObject(registryKeys, key => uniqueByKey(extended, defined, key));

  //
  //
  //
  // Prints
  //
  //
  //

  // An actuall output
  return [
    `import * as ${importNamespace} from "${importPath}";`,
    `import * as gm from "graphql-modules";`,
    printDefinedFields(),
    printDefinedEnumValues(),
    printDefinedInputFields(),
    printSchemaTypes(usedTypes),
    printScalars(visited),
    printResolveSignaturesPerType(visited),
    printResolversType(visited),
    printResolveMiddlewareMap(visited.objects),
  ].join('\n\n');

  /**
   * A dictionary of fields to pick from an object
   */
  function printDefinedFields() {
    const records = visited.objects.map(typeName => `${typeName}: ${printPicks(typeName, picks.objects)};`);

    return [
      'type DefinedFields = {',
      // Query: 'articles' | 'articleById' | 'articlesByUser';
      // Article: 'id' | 'title' | 'text' | 'author';
      ...records.map(indent(2)),
      '};',
    ].join('\n');
  }

  /**
   * A dictionary of values to pick from an enum
   */
  function printDefinedEnumValues() {
    const records = visited.enums.map(typeName => `${typeName}: ${printPicks(typeName, picks.enums)};`);

    return [
      'type DefinedEnumValues = {',
      // Enum: 'kind' | 'kind' | 'kind';
      ...records.map(indent(2)),
      '};',
    ].join('\n');
  }

  /**
   * A dictionary of fields to pick from an input
   */
  function printDefinedInputFields() {
    const records = visited.inputs.map(typeName => `${typeName}: ${printPicks(typeName, picks.inputs)};`);

    return [
      'type DefinedInputFields = {',
      // NewArticle: 'title' | 'text';
      ...records.map(indent(2)),
      '};',
    ].join('\n');
  }

  /**
   * Prints signatures of schema types with picks
   */
  function printSchemaTypes(types: string[]) {
    return types
      .filter(type => !visited.scalars.includes(type))
      .map(printExportType)
      .join('\n');
  }

  function printResolveSignaturesPerType(registry: Registry) {
    return [
      registry.objects.map(printResolverType('DefinedFields')).join('\n'),
      registry.enums.map(printResolverType('DefinedEnumValues')).join('\n'),
    ].join('\n');
  }

  function printScalars(registry: Registry) {
    if (!registry.scalars.length) {
      return '';
    }

    return [
      `export type Scalars = Pick<${importNamespace}.Scalars, ${registry.scalars.map(withQuotes).join(' | ')}>;`,
      ...registry.scalars.map(
        scalar => `export type ${scalar}ScalarConfig = ${importNamespace}.${scalar}ScalarConfig;`
      ),
    ].join('\n');
  }

  /**
   * Aggregation of type resolver signatures
   */
  function printResolversType(registry: Registry) {
    const records: string[] = [];

    for (const kind in registry) {
      const k = kind as RegistryKeys;
      if (registry.hasOwnProperty(k) && resolverKeys.includes(k as any)) {
        const types = registry[k];

        types.forEach(typeName => {
          if (k === 'scalars') {
            records.push(`${typeName}?: ${importNamespace}.Resolvers['${typeName}'];`);
          } else {
            records.push(`${typeName}?: ${typeName}Resolvers;`);
          }
        });
      }
    }

    return [
      'export type Resolvers = {',
      ...records.map(indent(2)),
      // Query: QueryResolvers;
      // Article: ArticleResolvers;
      '};',
    ].join('\n');
  }

  /**
   * Signature for a map of resolve middlewares
   */
  function printResolveMiddlewareMap(types: string[]) {
    const records: string[] = [printResolveMiddlewareRecord('*')];

    // Type.*
    records.push(...types.map(type => printResolveMiddlewareRecord(`${type}.*`)));

    // Type.Field
    for (const typeName in picks.objects) {
      if (picks.objects.hasOwnProperty(typeName)) {
        const fields = picks.objects[typeName];

        records.push(...fields.map(field => printResolveMiddlewareRecord(`${typeName}.${field}`)));
      }
    }

    return [
      'export interface ResolveMiddlewareMap {',
      ...records.map(indent(2)),
      // '*'?: ResolveMiddleware[];
      // 'Article.*'?: ResolveMiddleware[];
      // 'Article.user'?: ResolveMiddleware[];
      '};',
    ].join('\n');
  }

  function printResolveMiddlewareRecord(path: string): string {
    return `'${path}'?: gm.ResolveMiddleware[];`;
  }

  function printResolverType(picksTypeName: string) {
    return (typeName: string) => {
      return `export type ${typeName}Resolvers = Pick<${importNamespace}.${typeName}Resolvers, ${picksTypeName}['${typeName}']>;`;
    };
  }

  function printPicks(typeName: string, records: Record<string, string[]>): string {
    const fields = records[typeName].filter(unique);

    // We want to expose isTypeOf only to a module that defined the type
    if (!ROOT_TYPES.includes(typeName) && defined.objects.includes(typeName)) {
      fields.push('isTypeOf');
    }

    return fields.map(withQuotes).join(' | ');
  }

  function printTypeBody(typeName: string): string {
    const coreType = `${importNamespace}.${typeName}`;

    if (external.enums.includes(typeName) || external.objects.includes(typeName)) {
      return coreType;
    }

    if (defined.enums.includes(typeName) && picks.enums[typeName]) {
      return `Pick<${coreType}, DefinedEnumValues['${typeName}']>`;
    }

    if (defined.objects.includes(typeName) && picks.objects[typeName]) {
      return `Pick<${coreType}, DefinedFields['${typeName}']>`;
    }

    if (defined.inputs.includes(typeName) && picks.inputs[typeName]) {
      return `Pick<${coreType}, DefinedInputFields['${typeName}']>`;
    }

    return coreType;
  }

  function printExportType(typeName: string): string {
    return `export type ${typeName} = ${printTypeBody(typeName)};`;
  }

  //
  //
  //
  // Utils
  //
  //
  //

  function collectFieldsFromObject(node: ObjectTypeDefinitionNode | ObjectTypeExtensionNode) {
    const name = node.name.value;

    if (node.fields) {
      if (!picks.objects[name]) {
        picks.objects[name] = [];
      }

      node.fields.forEach(field => {
        picks.objects[name].push(field.name.value);
      });
    }
  }

  function collectFieldsFromInput(node: InputObjectTypeDefinitionNode | InputObjectTypeExtensionNode) {
    const name = node.name.value;

    if (node.fields) {
      if (!picks.inputs[name]) {
        picks.inputs[name] = [];
      }

      node.fields.forEach(field => {
        picks.inputs[name].push(field.name.value);
      });
    }
  }

  function collectValuesFromEnum(node: EnumTypeDefinitionNode | EnumTypeExtensionNode) {
    const name = node.name.value;

    if (node.values) {
      if (!picks.enums[name]) {
        picks.enums[name] = [];
      }

      node.values.forEach(field => {
        picks.enums[name].push(field.name.value);
      });
    }
  }

  function collectTypeDefinition(node: TypeDefinitionNode) {
    const name = node.name.value;

    switch (node.kind) {
      case Kind.OBJECT_TYPE_DEFINITION: {
        defined.objects.push(name);
        collectFieldsFromObject(node);
        break;
      }

      case Kind.ENUM_TYPE_DEFINITION: {
        defined.enums.push(name);
        collectValuesFromEnum(node);
        break;
      }

      case Kind.INPUT_OBJECT_TYPE_DEFINITION: {
        defined.inputs.push(name);
        collectFieldsFromInput(node);
        break;
      }

      case Kind.SCALAR_TYPE_DEFINITION: {
        defined.scalars.push(name);
        break;
      }

      // case Kind.INTERFACE_TYPE_DEFINITION: {
      //   defined.interfaces.push(name);
      //   break;
      // }
    }
  }

  function collectTypeExtension(node: TypeExtensionNode) {
    const name = node.name.value;

    switch (node.kind) {
      case Kind.OBJECT_TYPE_EXTENSION: {
        collectFieldsFromObject(node);
        // Do not include root types as extensions
        // so we can use them in DefinedFields
        if (ROOT_TYPES.includes(name)) {
          pushUnique(defined.objects, name);
          return;
        }

        pushUnique(extended.objects, name);

        break;
      }

      case Kind.ENUM_TYPE_EXTENSION: {
        collectValuesFromEnum(node);
        pushUnique(extended.enums, name);
        break;
      }

      case Kind.INPUT_OBJECT_TYPE_EXTENSION: {
        collectFieldsFromInput(node);
        pushUnique(extended.inputs, name);
        break;
      }

      // case Kind.INTERFACE_TYPE_EXTENSION: {
      //   pushUnique(extended.interfaces, name);
      //   break;
      // }
    }
  }
}
