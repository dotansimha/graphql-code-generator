import { visit, DocumentNode, ObjectTypeDefinitionNode, ObjectTypeExtensionNode } from 'graphql';
import { collectUsedTypes, unique, withQuotes, indent } from './utils';

// TODO: consider options of other plugins (naming convention etc)

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
  const definedFields: Record<string, string[]> = {};
  // List of types used in objects, fields, arguments etc
  const usedTypes = collectUsedTypes(doc);
  // Types defined in a module
  const definedTypes: string[] = [];
  // Types extended in a module
  const extendedTypes: string[] = [];

  visit(doc, {
    ObjectTypeDefinition(node) {
      collectDefinedType(node);
      collectFieldsFromObject(node);
    },
    ObjectTypeExtension(node) {
      collectTypeExtension(node);
      collectFieldsFromObject(node);
    },
  });

  // Types defined or extended in a module
  const touchedTypes = definedTypes.concat(extendedTypes);
  // Types that are not defined or extended in a module, they come from other modules
  const externalTypes: string[] = extendedTypes.filter(name => !definedTypes.includes(name));

  const importBlock = `import * as ${importNamespace} from "${importPath}";`;
  // A dictionary of fields to pick from an object
  const definedFieldsBlock = createDefinedFields(touchedTypes);
  // A block that exports all used schema types
  const exportedTypesBlock = usedTypes.map(createExportType).join('\n');
  // A block with resolver signatures
  const resolverTypesBlock = touchedTypes.map(createResolverType).join('\n');
  // Aggregation of type resolver signatures
  const resolversBlock = createResolversType(touchedTypes);

  // An actuall output
  return [importBlock, definedFieldsBlock, exportedTypesBlock, resolverTypesBlock, resolversBlock].join('\n\n');

  function createDefinedFields(types: string[]) {
    const records = types.map(typeName => `${typeName}: ${createPicks(typeName)};`);

    return [
      'type DefinedFields = {',
      // Query: 'articles' | 'articleById' | 'articlesByUser';
      // Article: 'id' | 'title' | 'text' | 'author';
      ...records.map(indent(2)),
      '};',
    ].join('\n');
  }

  function createResolversType(types: string[]) {
    const records = types.map(typeName => `${typeName}: ${typeName}Resolvers;`);

    return [
      'export type Resolvers = {',
      ...records.map(indent(2)),
      // Query: QueryResolvers;
      // Article: ArticleResolvers;
      '};',
    ].join('\n');
  }

  function createResolverType(typeName: string) {
    return `export type ${typeName}Resolvers = Pick<${importNamespace}.${typeName}Resolvers, DefinedFields['${typeName}']>;`;
  }

  function createPicks(typeName: string): string {
    return definedFields[typeName].filter(unique).map(withQuotes).join(' | ');
  }

  function createTypeBody(typeName: string): string {
    const coreType = `${importNamespace}.${typeName}`;

    if (externalTypes.includes(typeName) || !definedFields[typeName]) {
      return coreType;
    }

    return `Pick<${coreType}, DefinedFields['${typeName}']>`;
  }

  function createExportType(typeName: string): string {
    return `export type ${typeName} = ${createTypeBody(typeName)};`;
  }

  function collectFieldsFromObject(node: ObjectTypeDefinitionNode | ObjectTypeExtensionNode) {
    const name = node.name.value;

    if (node.fields) {
      if (!definedFields[name]) {
        definedFields[name] = [];
      }

      node.fields.forEach(field => {
        definedFields[name].push(field.name.value);
      });
    }
  }

  function collectDefinedType(node: ObjectTypeDefinitionNode) {
    definedTypes.push(node.name.value);
  }

  function collectTypeExtension(node: ObjectTypeExtensionNode) {
    const name = node.name.value;

    // Do not include root types as extensions
    // so we can use them in DefinedFields
    if (ROOT_TYPES.includes(name)) {
      if (!definedTypes.includes(name)) {
        definedTypes.push(name);
      }

      return;
    }

    if (!extendedTypes.includes(name)) {
      extendedTypes.push(name);
    }
  }
}
