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
  unique,
  withQuotes,
  buildBlock,
  pushUnique,
  concatByKey,
  uniqueByKey,
  createObject,
  collectUsedTypes,
} from './utils';

// TODO: consider options of other plugins (naming convention etc)

type RegistryKeys = 'objects' | 'inputs' | 'interfaces' | 'scalars' | 'unions' | 'enums';
type Registry = Record<RegistryKeys, string[]>;
const registryKeys: RegistryKeys[] = ['objects', 'inputs', 'interfaces', 'scalars', 'unions', 'enums'];
const resolverKeys: Array<Extract<RegistryKeys, 'objects' | 'enums' | 'scalars'>> = ['scalars', 'objects', 'enums'];

// TODO: Unfortunately it's static... for now
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
    InterfaceTypeDefinition(node) {
      collectTypeDefinition(node);
    },
    InterfaceTypeExtension(node) {
      collectTypeExtension(node);
    },
    ScalarTypeDefinition(node) {
      collectTypeDefinition(node);
    },
    UnionTypeDefinition(node) {
      collectTypeDefinition(node);
    },
    UnionTypeExtension(node) {
      collectTypeExtension(node);
    },
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
    printResolveMiddlewareMap(),
  ].join('\n\n');

  /**
   * A dictionary of fields to pick from an object
   */
  function printDefinedFields() {
    return buildBlock({
      name: 'interface DefinedFields',
      lines: visited.objects.map(typeName => `${typeName}: ${printPicks(typeName, picks.objects)};`),
    });
  }

  /**
   * A dictionary of values to pick from an enum
   */
  function printDefinedEnumValues() {
    return buildBlock({
      name: 'interface DefinedEnumValues',
      lines: visited.enums.map(typeName => `${typeName}: ${printPicks(typeName, picks.enums)};`),
    });
  }

  /**
   * A dictionary of fields to pick from an input
   */
  function printDefinedInputFields() {
    return buildBlock({
      name: 'interface DefinedInputFields',
      lines: visited.inputs.map(typeName => `${typeName}: ${printPicks(typeName, picks.inputs)};`),
    });
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
      registry.objects
        .map(name =>
          printResolverType(
            name,
            'DefinedFields',
            !ROOT_TYPES.includes(name) && defined.objects.includes(name) ? ` | '__isTypeOf'` : ''
          )
        )
        .join('\n'),
      registry.enums.map(name => printResolverType(name, 'DefinedEnumValues')).join('\n'),
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
    const lines: string[] = [];

    for (const kind in registry) {
      const k = kind as RegistryKeys;
      if (registry.hasOwnProperty(k) && resolverKeys.includes(k as any)) {
        const types = registry[k];

        types.forEach(typeName => {
          if (k === 'scalars') {
            lines.push(`${typeName}?: ${importNamespace}.Resolvers['${typeName}'];`);
          } else {
            lines.push(`${typeName}?: ${typeName}Resolvers;`);
          }
        });
      }
    }

    return buildBlock({
      name: 'export interface Resolvers',
      lines,
    });
  }

  /**
   * Signature for a map of resolve middlewares
   */
  function printResolveMiddlewareMap() {
    const wildcardField = printResolveMiddlewareRecord(withQuotes('*'));
    const blocks: string[] = [buildBlock({ name: `${withQuotes('*')}?:`, lines: [wildcardField] })];

    // Type.Field
    for (const typeName in picks.objects) {
      if (picks.objects.hasOwnProperty(typeName)) {
        const fields = picks.objects[typeName];
        const lines = [wildcardField].concat(fields.map(field => printResolveMiddlewareRecord(field)));

        blocks.push(
          buildBlock({
            name: `${typeName}?:`,
            lines,
          })
        );
      }
    }

    return buildBlock({
      name: 'export interface ResolveMiddlewareMap',
      lines: blocks,
    });
  }

  function printResolveMiddlewareRecord(path: string): string {
    return `${path}?: gm.ResolveMiddleware[];`;
  }

  function printResolverType(typeName: string, picksTypeName: string, extraKeys = '') {
    return `export type ${typeName}Resolvers = Pick<${importNamespace}.${typeName}Resolvers, ${picksTypeName}['${typeName}']${extraKeys}>;`;
  }

  function printPicks(typeName: string, records: Record<string, string[]>): string {
    return records[typeName].filter(unique).map(withQuotes).join(' | ');
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

      case Kind.INTERFACE_TYPE_DEFINITION: {
        defined.interfaces.push(name);
        break;
      }

      case Kind.UNION_TYPE_DEFINITION: {
        defined.unions.push(name);
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

      case Kind.INPUT_OBJECT_TYPE_EXTENSION: {
        collectFieldsFromInput(node);
        pushUnique(extended.inputs, name);
        break;
      }

      case Kind.INTERFACE_TYPE_EXTENSION: {
        pushUnique(extended.interfaces, name);
        break;
      }

      case Kind.UNION_TYPE_EXTENSION: {
        pushUnique(extended.unions, name);
        break;
      }
    }
  }
}
