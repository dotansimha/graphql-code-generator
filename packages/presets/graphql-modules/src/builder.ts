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
  GraphQLSchema,
  isScalarType,
  InterfaceTypeDefinitionNode,
  InterfaceTypeExtensionNode,
} from 'graphql';
import { pascalCase } from 'change-case-all';
import {
  unique,
  withQuotes,
  buildBlock,
  pushUnique,
  concatByKey,
  uniqueByKey,
  createObject,
  collectUsedTypes,
  indent,
} from './utils';
import { ModulesConfig } from './config';
import { BaseVisitor } from '@graphql-codegen/visitor-plugin-common';

type RegistryKeys = 'objects' | 'inputs' | 'interfaces' | 'scalars' | 'unions' | 'enums';
type Registry = Record<RegistryKeys, string[]>;
const registryKeys: RegistryKeys[] = ['objects', 'inputs', 'interfaces', 'scalars', 'unions', 'enums'];
const resolverKeys: Array<Extract<RegistryKeys, 'objects' | 'enums' | 'scalars'>> = ['scalars', 'objects', 'enums'];

export function buildModule(
  name: string,
  doc: DocumentNode,
  {
    importNamespace,
    importPath,
    encapsulate,
    shouldDeclare,
    rootTypes,
    schema,
    baseVisitor,
  }: {
    importNamespace: string;
    importPath: string;
    encapsulate: ModulesConfig['encapsulateModuleTypes'];
    shouldDeclare: boolean;
    rootTypes: string[];
    baseVisitor: BaseVisitor;
    schema?: GraphQLSchema;
  }
): string {
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

  // An actual output
  const imports = [`import * as ${importNamespace} from "${importPath}";`, `import * as gm from "graphql-modules";`];

  let content = [
    printDefinedFields(),
    printDefinedEnumValues(),
    printDefinedInputFields(),
    printSchemaTypes(usedTypes),
    printScalars(visited),
    printResolveSignaturesPerType(visited),
    printResolversType(visited),
    printResolveMiddlewareMap(),
  ]
    .filter(Boolean)
    .join('\n\n');

  if (encapsulate === 'namespace') {
    content =
      `${shouldDeclare ? 'declare' : 'export'} namespace ${baseVisitor.convertName(name, {
        suffix: 'Module',
        useTypesPrefix: false,
        useTypesSuffix: false,
      })} {\n` +
      (shouldDeclare ? `${indent(2)(imports.join('\n'))}\n` : '') +
      indent(2)(content) +
      '\n}';
  }

  return [...(!shouldDeclare ? imports : []), content].filter(Boolean).join('\n');

  /**
   * A dictionary of fields to pick from an object
   */
  function printDefinedFields() {
    return buildBlock({
      name: `interface DefinedFields`,
      lines: [...visited.objects, ...visited.interfaces].map(
        typeName =>
          `${typeName}: ${printPicks(typeName, {
            ...picks.objects,
            ...picks.interfaces,
          })};`
      ),
    });
  }

  /**
   * A dictionary of values to pick from an enum
   */
  function printDefinedEnumValues() {
    return buildBlock({
      name: `interface DefinedEnumValues`,
      lines: visited.enums.map(typeName => `${typeName}: ${printPicks(typeName, picks.enums)};`),
    });
  }

  function encapsulateTypeName(typeName: string): string {
    if (encapsulate === 'prefix') {
      return `${pascalCase(name)}_${typeName}`;
    }

    return typeName;
  }

  /**
   * A dictionary of fields to pick from an input
   */
  function printDefinedInputFields() {
    return buildBlock({
      name: `interface DefinedInputFields`,
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
      [...registry.objects, ...registry.interfaces]
        .map(name =>
          printResolverType(
            name,
            'DefinedFields',
            !rootTypes.includes(name) && defined.objects.includes(name) ? ` | '__isTypeOf'` : ''
          )
        )
        .join('\n'),
    ].join('\n');
  }

  function printScalars(registry: Registry) {
    if (!registry.scalars.length) {
      return '';
    }

    return [
      `export type ${encapsulateTypeName('Scalars')} = Pick<${importNamespace}.Scalars, ${registry.scalars
        .map(withQuotes)
        .join(' | ')}>;`,
      ...registry.scalars.map(scalar => {
        const convertedName = baseVisitor.convertName(scalar, {
          suffix: 'ScalarConfig',
        });
        return `export type ${encapsulateTypeName(convertedName)} = ${importNamespace}.${convertedName};`;
      }),
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
          if (k === 'enums') {
            return;
          } else if (k === 'scalars') {
            lines.push(`${typeName}?: ${encapsulateTypeName(importNamespace)}.Resolvers['${typeName}'];`);
          } else {
            lines.push(`${typeName}?: ${encapsulateTypeName(typeName)}Resolvers;`);
          }
        });
      }
    }

    return buildBlock({
      name: `export interface ${encapsulateTypeName('Resolvers')}`,
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
      name: `export interface ${encapsulateTypeName('MiddlewareMap')}`,
      lines: blocks,
    });
  }

  function printResolveMiddlewareRecord(path: string): string {
    return `${path}?: gm.Middleware[];`;
  }

  function printResolverType(typeName: string, picksTypeName: string, extraKeys = '') {
    return `export type ${encapsulateTypeName(
      `${typeName}Resolvers`
    )} = Pick<${importNamespace}.${baseVisitor.convertName(typeName, {
      suffix: 'Resolvers',
    })}, ${picksTypeName}['${typeName}']${extraKeys}>;`;
  }

  function printPicks(typeName: string, records: Record<string, string[]>): string {
    return records[typeName].filter(unique).map(withQuotes).join(' | ');
  }

  function printTypeBody(typeName: string): string {
    const coreType = `${importNamespace}.${baseVisitor.convertName(typeName, {
      useTypesSuffix: true,
      useTypesPrefix: true,
    })}`;

    if (external.enums.includes(typeName) || external.objects.includes(typeName)) {
      if (schema && isScalarType(schema.getType(typeName))) {
        return `${importNamespace}.Scalars['${typeName}']`;
      }

      return coreType;
    }

    if (defined.enums.includes(typeName) && picks.enums[typeName]) {
      return `DefinedEnumValues['${typeName}']`;
    }

    if (defined.objects.includes(typeName) && picks.objects[typeName]) {
      return `Pick<${coreType}, DefinedFields['${typeName}']>`;
    }

    if (defined.interfaces.includes(typeName) && picks.interfaces[typeName]) {
      return `Pick<${coreType}, DefinedFields['${typeName}']>`;
    }

    if (defined.inputs.includes(typeName) && picks.inputs[typeName]) {
      return `Pick<${coreType}, DefinedInputFields['${typeName}']>`;
    }

    return coreType;
  }

  function printExportType(typeName: string): string {
    return `export type ${encapsulateTypeName(typeName)} = ${printTypeBody(typeName)};`;
  }

  //
  //
  //
  // Utils
  //
  //
  //

  function collectFields(
    node:
      | ObjectTypeDefinitionNode
      | ObjectTypeExtensionNode
      | InterfaceTypeDefinitionNode
      | InterfaceTypeExtensionNode
      | InputObjectTypeDefinitionNode
      | InputObjectTypeExtensionNode,
    picksObj: Record<string, string[]>
  ) {
    const name = node.name.value;

    if (node.fields) {
      if (!picksObj[name]) {
        picksObj[name] = [];
      }

      node.fields.forEach(field => {
        picksObj[name].push(field.name.value);
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
        collectFields(node, picks.objects);
        break;
      }

      case Kind.ENUM_TYPE_DEFINITION: {
        defined.enums.push(name);
        collectValuesFromEnum(node);
        break;
      }

      case Kind.INPUT_OBJECT_TYPE_DEFINITION: {
        defined.inputs.push(name);
        collectFields(node, picks.inputs);
        break;
      }

      case Kind.SCALAR_TYPE_DEFINITION: {
        defined.scalars.push(name);
        break;
      }

      case Kind.INTERFACE_TYPE_DEFINITION: {
        defined.interfaces.push(name);
        collectFields(node, picks.interfaces);
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
        collectFields(node, picks.objects);
        // Do not include root types as extensions
        // so we can use them in DefinedFields
        if (rootTypes.includes(name)) {
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
        collectFields(node, picks.inputs);
        pushUnique(extended.inputs, name);
        break;
      }

      case Kind.INTERFACE_TYPE_EXTENSION: {
        collectFields(node, picks.interfaces);
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
