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
  const definedObjectFields: Record<string, string[]> = {};
  const definedEnumValues: Record<string, string[]> = {};

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
    // InputObjectTypeDefinition(node) {
    //   collectTypeDefinition(node);
    // },
    // InputObjectTypeExtension(node) {
    //   collectTypeExtension(node);
    // },
    // InterfaceTypeDefinition(node) {
    //   collectTypeDefinition(node);
    // },
    // InterfaceTypeExtension(node) {
    //   collectTypeExtension(node);
    // },
    // ScalarTypeDefinition(node) {
    //   collectTypeDefinition(node);
    // },
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
    printDefinedFields(visited.objects),
    printDefinedEnumValues(visited.enums),
    printSchemaTypes(usedTypes),
    printResolveSignaturesPerType(visited),
    printResolversType(visited),
    printResolveMiddlewareMap(visited.objects),
  ].join('\n\n');

  /**
   * A dictionary of fields to pick from an object
   */
  function printDefinedFields(types: string[]) {
    const records = types.map(typeName => `${typeName}: ${printPicks(typeName, definedObjectFields)};`);

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
  function printDefinedEnumValues(types: string[]) {
    const records = types.map(typeName => `${typeName}: ${printPicks(typeName, definedEnumValues)};`);

    return [
      'type DefinedEnumValues = {',
      // Enum: 'kind' | 'kind' | 'kind';
      ...records.map(indent(2)),
      '};',
    ].join('\n');
  }

  /**
   * Prints signatures of schema types with picks
   */
  function printSchemaTypes(types: string[]) {
    return types.map(printExportType).join('\n');
  }

  function printResolveSignaturesPerType(registry: Registry) {
    return [
      registry.objects.map(printResolverType('DefinedFields')).join('\n'),
      registry.enums.map(printResolverType('DefinedEnumValues')).join('\n'),
    ].join('\n');
  }

  /**
   * Aggregation of type resolver signatures
   */
  function printResolversType(registry: Registry) {
    const records: string[] = [];

    for (const kind in registry) {
      if (registry.hasOwnProperty(kind)) {
        const types: string[] = registry[kind];

        types.forEach(typeName => {
          records.push(`${typeName}: ${typeName}Resolvers;`);
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
    for (const typeName in definedObjectFields) {
      if (definedObjectFields.hasOwnProperty(typeName)) {
        const fields = definedObjectFields[typeName];

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
    return records[typeName].filter(unique).map(withQuotes).join(' | ');
  }

  function printTypeBody(typeName: string): string {
    const coreType = `${importNamespace}.${typeName}`;

    if (external.enums.includes(typeName) || external.objects.includes(typeName)) {
      return coreType;
    }

    if (defined.enums.includes(typeName) && definedEnumValues[typeName]) {
      return `Pick<${coreType}, DefinedEnumValues['${typeName}']>`;
    }

    if (defined.objects.includes(typeName) && definedObjectFields[typeName]) {
      return `Pick<${coreType}, DefinedFields['${typeName}']>`;
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
      if (!definedObjectFields[name]) {
        definedObjectFields[name] = [];
      }

      node.fields.forEach(field => {
        definedObjectFields[name].push(field.name.value);
      });
    }
  }

  function collectValuesFromEnum(node: EnumTypeDefinitionNode | EnumTypeExtensionNode) {
    const name = node.name.value;

    if (node.values) {
      if (!definedEnumValues[name]) {
        definedEnumValues[name] = [];
      }

      node.values.forEach(field => {
        definedEnumValues[name].push(field.name.value);
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
    }
  }
}
