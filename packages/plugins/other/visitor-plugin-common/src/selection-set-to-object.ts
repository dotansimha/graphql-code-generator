import { createHash } from 'crypto';
import { getBaseType } from '@graphql-codegen/plugin-helpers';
import { getRootTypes } from '@graphql-tools/utils';
import autoBind from 'auto-bind';
import {
  DirectiveNode,
  FieldNode,
  FragmentSpreadNode,
  GraphQLField,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  InlineFragmentNode,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isTypeSubTypeOf,
  isUnionType,
  Kind,
  SchemaMetaFieldDef,
  SelectionNode,
  SelectionSetNode,
  TypeMetaFieldDef,
} from 'graphql';
import { ParsedDocumentsConfig } from './base-documents-visitor.js';
import { BaseVisitorConvertOptions } from './base-visitor.js';
import {
  BaseSelectionSetProcessor,
  LinkField,
  NameAndType,
  PrimitiveAliasedFields,
  PrimitiveField,
  ProcessResult,
} from './selection-set-processor/base.js';
import {
  ConvertNameFn,
  FragmentDirectives,
  GetFragmentSuffixFn,
  LoadedFragment,
  NormalizedScalarsMap,
} from './types.js';
import {
  DeclarationBlock,
  DeclarationBlockConfig,
  getFieldNames,
  getFieldNodeNameValue,
  getPossibleTypes,
  hasConditionalDirectives,
  hasIncrementalDeliveryDirectives,
  mergeSelectionSets,
  separateSelectionSet,
} from './utils.js';

type FragmentSpreadUsage = {
  fragmentName: string;
  typeName: string;
  onType: string;
  selectionNodes: Array<SelectionNode>;
  fragmentDirectives?: DirectiveNode[];
};

interface DependentType {
  name: string;
  content: string;
  isUnionType?: boolean;
}

type CollectedFragmentNode = (SelectionNode | FragmentSpreadUsage | DirectiveNode) & FragmentDirectives;
type GroupedStringifiedTypes = Record<string, Array<string | { union: string[] }>>;

const operationTypes: string[] = ['Query', 'Mutation', 'Subscription'];

function isMetadataFieldName(name: string) {
  return ['__schema', '__type'].includes(name);
}

const metadataFieldMap: Record<string, GraphQLField<any, any>> = {
  __schema: SchemaMetaFieldDef,
  __type: TypeMetaFieldDef,
};

export class SelectionSetToObject<Config extends ParsedDocumentsConfig = ParsedDocumentsConfig> {
  protected _primitiveFields: PrimitiveField[] = [];
  protected _primitiveAliasedFields: PrimitiveAliasedFields[] = [];
  protected _linksFields: LinkField[] = [];
  protected _queriedForTypename = false;

  constructor(
    protected _processor: BaseSelectionSetProcessor<any>,
    protected _scalars: NormalizedScalarsMap,
    protected _schema: GraphQLSchema,
    protected _convertName: ConvertNameFn<BaseVisitorConvertOptions>,
    protected _getFragmentSuffix: GetFragmentSuffixFn,
    protected _loadedFragments: LoadedFragment[],
    protected _config: Config,
    protected _parentSchemaType?: GraphQLNamedType,
    protected _selectionSet?: SelectionSetNode
  ) {
    autoBind(this);
  }

  public createNext(parentSchemaType: GraphQLNamedType, selectionSet: SelectionSetNode): SelectionSetToObject {
    return new SelectionSetToObject(
      this._processor,
      this._scalars,
      this._schema,
      this._convertName.bind(this),
      this._getFragmentSuffix.bind(this),
      this._loadedFragments,
      this._config,
      parentSchemaType,
      selectionSet
    );
  }

  /**
   * traverse the inline fragment nodes recursively for collecting the selectionSets on each type
   */
  _collectInlineFragments(
    parentType: GraphQLNamedType,
    nodes: Array<InlineFragmentNode & FragmentDirectives>,
    types: Map<string, Array<CollectedFragmentNode>>
  ) {
    if (isListType(parentType) || isNonNullType(parentType)) {
      return this._collectInlineFragments(parentType.ofType as GraphQLNamedType, nodes, types);
    }
    if (isObjectType(parentType)) {
      for (const node of nodes) {
        const typeOnSchema = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = separateSelectionSet(node.selectionSet.selections);
        const spreadsUsage = this.buildFragmentSpreadsUsage(spreads);
        const directives = (node.directives as DirectiveNode[]) || undefined;

        // When we collect the selection sets of inline fragments we need to
        // make sure directives on the inline fragments are stored in a way
        // that can be associated back to the fields in the fragment, to
        // support things like making those fields optional when deferring a
        // fragment (using @defer).
        const fieldsWithFragmentDirectives: CollectedFragmentNode[] = fields.map(field => ({
          ...field,
          fragmentDirectives: field.fragmentDirectives || directives,
        }));

        if (isObjectType(typeOnSchema)) {
          this._appendToTypeMap(types, typeOnSchema.name, fieldsWithFragmentDirectives);
          this._appendToTypeMap(types, typeOnSchema.name, spreadsUsage[typeOnSchema.name]);
          this._appendToTypeMap(types, typeOnSchema.name, directives);
          this._collectInlineFragments(typeOnSchema, inlines, types);
        } else if (isInterfaceType(typeOnSchema) && parentType.getInterfaces().includes(typeOnSchema)) {
          this._appendToTypeMap(types, parentType.name, fields);
          this._appendToTypeMap(types, parentType.name, spreadsUsage[parentType.name]);
          this._collectInlineFragments(typeOnSchema, inlines, types);
        }
      }
    } else if (isInterfaceType(parentType)) {
      const possibleTypes = getPossibleTypes(this._schema, parentType);

      for (const node of nodes) {
        const schemaType = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = separateSelectionSet(node.selectionSet.selections);
        const spreadsUsage = this.buildFragmentSpreadsUsage(spreads);

        if (isObjectType(schemaType) && possibleTypes.find(possibleType => possibleType.name === schemaType.name)) {
          this._appendToTypeMap(types, schemaType.name, fields);
          this._appendToTypeMap(types, schemaType.name, spreadsUsage[schemaType.name]);
          this._collectInlineFragments(schemaType, inlines, types);
        } else if (isInterfaceType(schemaType) && schemaType.name === parentType.name) {
          for (const possibleType of possibleTypes) {
            this._appendToTypeMap(types, possibleType.name, fields);
            this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
            this._collectInlineFragments(schemaType, inlines, types);
          }
        } else {
          // it must be an interface type that is spread on an interface field
          for (const possibleType of possibleTypes) {
            if (!node.typeCondition) {
              throw new Error('Invalid state. Expected type condition for interface spread on a interface field.');
            }
            const fragmentSpreadType = this._schema.getType(node.typeCondition.name.value);
            // the field should only be added to the valid selections
            // in case the possible type actually implements the given interface
            if (isTypeSubTypeOf(this._schema, possibleType, fragmentSpreadType)) {
              this._appendToTypeMap(types, possibleType.name, fields);
              this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
            }
          }
        }
      }
    } else if (isUnionType(parentType)) {
      const possibleTypes = parentType.getTypes();

      for (const node of nodes) {
        const schemaType = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = separateSelectionSet(node.selectionSet.selections);
        const spreadsUsage = this.buildFragmentSpreadsUsage(spreads);

        if (isObjectType(schemaType) && possibleTypes.find(possibleType => possibleType.name === schemaType.name)) {
          this._appendToTypeMap(types, schemaType.name, fields);
          this._appendToTypeMap(types, schemaType.name, spreadsUsage[schemaType.name]);
          this._collectInlineFragments(schemaType, inlines, types);
        } else if (isInterfaceType(schemaType)) {
          const possibleInterfaceTypes = getPossibleTypes(this._schema, schemaType);

          for (const possibleType of possibleTypes) {
            if (
              possibleInterfaceTypes.find(possibleInterfaceType => possibleInterfaceType.name === possibleType.name)
            ) {
              this._appendToTypeMap(types, possibleType.name, fields);
              this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
              this._collectInlineFragments(schemaType, inlines, types);
            }
          }
        } else {
          for (const possibleType of possibleTypes) {
            this._appendToTypeMap(types, possibleType.name, fields);
            this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
          }
        }
      }
    }
  }

  protected _createInlineFragmentForFieldNodes(
    parentType: GraphQLNamedType,
    fieldNodes: FieldNode[]
  ): InlineFragmentNode {
    return {
      kind: Kind.INLINE_FRAGMENT,
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
          value: parentType.name,
        },
      },
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: fieldNodes,
      },
    };
  }

  /**
   * The `buildFragmentSpreadsUsage` method is used to collect fields from fragment spreads in the selection set.
   * It creates a record of fragment spread usages, which includes the fragment name, type name, and the selection nodes
   * inside the fragment.
   */
  protected buildFragmentSpreadsUsage(spreads: FragmentSpreadNode[]): Record<string, FragmentSpreadUsage[]> {
    const selectionNodesByTypeName: Record<string, FragmentSpreadUsage[]> = {};

    for (const spread of spreads) {
      const fragmentSpreadObject = this._loadedFragments.find(lf => lf.name === spread.name.value);

      if (fragmentSpreadObject) {
        const schemaType = this._schema.getType(fragmentSpreadObject.onType);
        const possibleTypesForFragment = getPossibleTypes(this._schema, schemaType);

        for (const possibleType of possibleTypesForFragment) {
          const fragmentSuffix = this._getFragmentSuffix(spread.name.value);
          const usage = this.buildFragmentTypeName(
            spread.name.value,
            fragmentSuffix,
            possibleTypesForFragment.length === 1 ? null : possibleType.name
          );

          selectionNodesByTypeName[possibleType.name] ||= [];

          selectionNodesByTypeName[possibleType.name].push({
            fragmentName: spread.name.value,
            typeName: usage,
            onType: fragmentSpreadObject.onType,
            selectionNodes: [...fragmentSpreadObject.node.selectionSet.selections],
            fragmentDirectives: [...spread.directives],
          });
        }
      }
    }

    return selectionNodesByTypeName;
  }

  protected flattenSelectionSet(
    selections: ReadonlyArray<SelectionNode>,
    parentSchemaType?: GraphQLObjectType<any, any>
  ): Map<string, Array<SelectionNode | FragmentSpreadUsage>> {
    const selectionNodesByTypeName = new Map<string, Array<SelectionNode | FragmentSpreadUsage>>();
    const inlineFragmentSelections: InlineFragmentNode[] = [];
    const fieldNodes: FieldNode[] = [];
    const fragmentSpreads: FragmentSpreadNode[] = [];
    for (const selection of selections) {
      switch (selection.kind) {
        case Kind.FIELD:
          fieldNodes.push(selection);
          break;
        case Kind.INLINE_FRAGMENT:
          inlineFragmentSelections.push(selection);
          break;
        case Kind.FRAGMENT_SPREAD:
          fragmentSpreads.push(selection);
          break;
      }
    }

    if (fieldNodes.length) {
      inlineFragmentSelections.push(
        this._createInlineFragmentForFieldNodes(parentSchemaType ?? this._parentSchemaType, fieldNodes)
      );
    }

    this._collectInlineFragments(
      parentSchemaType ?? this._parentSchemaType,
      inlineFragmentSelections,
      selectionNodesByTypeName
    );
    const fragmentsUsage = this.buildFragmentSpreadsUsage(fragmentSpreads);

    for (const [typeName, records] of Object.entries(fragmentsUsage)) {
      this._appendToTypeMap(selectionNodesByTypeName, typeName, records);
    }

    return selectionNodesByTypeName;
  }

  private _appendToTypeMap<T = CollectedFragmentNode>(
    types: Map<string, Array<T>>,
    typeName: string,
    nodes: Array<T>
  ): void {
    if (!types.has(typeName)) {
      types.set(typeName, []);
    }

    if (nodes && nodes.length > 0) {
      types.get(typeName).push(...nodes);
    }
  }

  protected _buildGroupedSelections(parentName: string): {
    grouped: GroupedStringifiedTypes;
    dependentTypes: DependentType[];
    mustAddEmptyObject: boolean;
  } {
    if (!this._selectionSet?.selections || this._selectionSet.selections.length === 0) {
      return { grouped: {}, mustAddEmptyObject: true, dependentTypes: [] };
    }

    const selectionNodesByTypeName = this.flattenSelectionSet(this._selectionSet.selections);

    // in case there is not a selection for each type, we need to add a empty type.
    let mustAddEmptyObject = false;

    const possibleTypes = getPossibleTypes(this._schema, this._parentSchemaType);

    const dependentTypes: DependentType[] = [];
    if (!this._config.mergeFragmentTypes || this._config.inlineFragmentTypes === 'mask') {
      const grouped = possibleTypes.reduce<GroupedStringifiedTypes>((prev, type) => {
        const typeName = type.name;
        const schemaType = this._schema.getType(typeName);

        if (!isObjectType(schemaType)) {
          throw new TypeError(`Invalid state! Schema type ${typeName} is not a valid GraphQL object!`);
        }

        const allNodes = selectionNodesByTypeName.get(typeName) || [];

        prev[typeName] ||= [];

        // incrementalNodes are the ones flagged with @defer, meaning they become nullable
        const { incrementalNodes, selectionNodes, fragmentSpreads } = allNodes.reduce<{
          selectionNodes: (SelectionNode | FragmentSpreadUsage)[];
          incrementalNodes: FragmentSpreadUsage[];
          fragmentSpreads: string[];
        }>(
          (acc, node) => {
            if ('fragmentDirectives' in node && hasIncrementalDeliveryDirectives(node.fragmentDirectives)) {
              acc.incrementalNodes.push(node);
            } else {
              acc.selectionNodes.push(node);
            }
            return acc;
          },
          { selectionNodes: [], incrementalNodes: [], fragmentSpreads: [] }
        );

        const { fields, dependentTypes: subDependentTypes } = this.buildSelectionSet(schemaType, selectionNodes, {
          parentFieldName: this.buildParentFieldName(typeName, parentName),
        });
        const transformedSet = this.selectionSetStringFromFields(fields);

        if (transformedSet) {
          prev[typeName].push(transformedSet);
        }
        dependentTypes.push(...subDependentTypes);
        if (!transformedSet && !fragmentSpreads.length) {
          mustAddEmptyObject = true;
        }

        for (const incrementalNode of incrementalNodes) {
          if (this._config.inlineFragmentTypes === 'mask' && 'fragmentName' in incrementalNode) {
            const { fields: incrementalFields, dependentTypes: incrementalDependentTypes } = this.buildSelectionSet(
              schemaType,
              [incrementalNode],
              { unsetTypes: true, parentFieldName: parentName }
            );
            const incrementalSet = this.selectionSetStringFromFields(incrementalFields);
            prev[typeName].push(incrementalSet);
            dependentTypes.push(...incrementalDependentTypes);

            continue;
          }
          const { fields: initialFields, dependentTypes: initialDependentTypes } = this.buildSelectionSet(
            schemaType,
            [incrementalNode],
            { parentFieldName: parentName }
          );

          const { fields: subsequentFields, dependentTypes: subsequentDependentTypes } = this.buildSelectionSet(
            schemaType,
            [incrementalNode],
            { unsetTypes: true, parentFieldName: parentName }
          );

          const initialSet = this.selectionSetStringFromFields(initialFields);
          const subsequentSet = this.selectionSetStringFromFields(subsequentFields);
          dependentTypes.push(...initialDependentTypes, ...subsequentDependentTypes);
          prev[typeName].push({ union: [initialSet, subsequentSet] });
        }

        return prev;
      }, {});

      return { grouped, mustAddEmptyObject, dependentTypes };
    }
    // Accumulate a map of selected fields to the typenames that
    // share the exact same selected fields. When we find multiple
    // typenames with the same set of fields, we can collapse the
    // generated type to the selected fields and a string literal
    // union of the typenames.
    //
    // E.g. {
    //        __typename: "foo" | "bar";
    //        shared: string;
    //      }
    const grouped = possibleTypes.reduce<
      Record<string, { fields: (string | NameAndType)[]; types: { name: string; type: string }[] }>
    >((prev, type) => {
      const typeName = type.name;
      const schemaType = this._schema.getType(typeName);

      if (!isObjectType(schemaType)) {
        throw new TypeError(`Invalid state! Schema type ${typeName} is not a valid GraphQL object!`);
      }

      const selectionNodes = selectionNodesByTypeName.get(typeName) || [];

      const {
        typeInfo,
        fields,
        dependentTypes: subDependentTypes,
      } = this.buildSelectionSet(schemaType, selectionNodes, {
        parentFieldName: this.buildParentFieldName(typeName, parentName),
      });
      dependentTypes.push(...subDependentTypes);

      const key = this.selectionSetStringFromFields(fields);
      prev[key] = {
        fields,
        types: [...(prev[key]?.types ?? []), typeInfo || { name: '', type: type.name }].filter(Boolean),
      };

      return prev;
    }, {});

    // For every distinct set of fields, create the corresponding
    // string literal union of typenames.
    const compacted = Object.keys(grouped).reduce<Record<string, string[]>>((acc, key) => {
      const typeNames = grouped[key].types.map(t => t.type);
      // Don't create very large string literal unions. TypeScript
      // will stop comparing some nested union types types when
      // they contain props with more than some number of string
      // literal union members (testing with TS 4.5 stops working
      // at 25 for a naive test case:
      // https://www.typescriptlang.org/play?ts=4.5.4&ssl=29&ssc=10&pln=29&pc=1#code/C4TwDgpgBAKg9nAMgQwE4HNoF4BQV9QA+UA3ngRQJYB21EqAXDsQEQCMLzULATJ6wGZ+3ACzCWAVnEA2cQHZxADnEBOcWwAM6jl3Z9dbIQbEGpB2QYUHlBtbp5b7O1j30ujLky7Os4wABb0nAC+ODigkFAAQlBYUOT4xGQUVLT0TKzO3G7cHqLiPtwWrFasNqx2mY6ZWXrqeexe3GyF7MXNpc3lzZXZ1dm1ruI8DTxNvGahFEkJKTR0jLMpRNx+gaicy6E4APQ7AALAAM4AtJTo1HCoEDgANhDAUMgMsAgoGNikwQDcdw9QACMXjE4shfmEItAAGI0bCzGbLfDzdIGYbiBrjVrtFidFjdFi9dj9di1Ng5dgNNjjFrqbFsXFsfFsQkOYaDckjYbjNZBHDbPaHU7nS7XP6PZBsF4wuixL6-e6PAGS6KyiXfIA
      const max_types = 20;
      for (let i = 0; i < typeNames.length; i += max_types) {
        const selectedTypes = typeNames.slice(i, i + max_types);
        const typenameUnion = grouped[key].types[0].name
          ? this._processor.transformTypenameField(selectedTypes.join(' | '), grouped[key].types[0].name)
          : [];
        const transformedSet = this.selectionSetStringFromFields([...typenameUnion, ...grouped[key].fields]);

        // The keys here will be used to generate intermediary
        // fragment names. To avoid blowing up the type name on large
        // unions, calculate a stable hash here instead.
        //
        // Also use fragment hashing if skipTypename is true, since we
        // then don't have a typename for naming the fragment.
        acc[
          selectedTypes.length <= 3
            ? // Remove quote marks to produce a valid type name
              selectedTypes.map(t => t.replace(/'/g, '')).join('_')
            : createHash('sha256')
                .update(selectedTypes.join() || transformedSet || '')
                // Remove invalid characters to produce a valid type name
                .digest('base64')
                .replace(/[=+/]/g, '')
        ] = [transformedSet];
      }
      return acc;
    }, {});

    return { grouped: compacted, mustAddEmptyObject, dependentTypes };
  }

  protected selectionSetStringFromFields(fields: (string | NameAndType)[]): string | null {
    const allStrings = fields.filter((f: string | NameAndType): f is string => typeof f === 'string');
    const allObjects = fields
      .filter((f: string | NameAndType): f is NameAndType => typeof f !== 'string')
      .map(t => `${t.name}: ${t.type}`);
    const mergedObjects = allObjects.length ? this._processor.buildFieldsIntoObject(allObjects) : null;
    const transformedSet = this._processor.buildSelectionSetFromStrings([...allStrings, mergedObjects].filter(Boolean));
    return transformedSet;
  }

  protected buildSelectionSet(
    parentSchemaType: GraphQLObjectType,
    selectionNodes: Array<SelectionNode | FragmentSpreadUsage | DirectiveNode>,
    options: { unsetTypes?: boolean; parentFieldName?: string }
  ) {
    const primitiveFields = new Map<string, FieldNode>();
    const primitiveAliasFields = new Map<string, FieldNode>();
    const linkFieldSelectionSets = new Map<
      string,
      {
        selectedFieldType: GraphQLOutputType;
        field: FieldNode;
      }
    >();
    let requireTypename = false;

    // usages via fragment typescript type
    const fragmentsSpreadUsages: string[] = [];

    // ensure we mutate no function params
    selectionNodes = [...selectionNodes];
    let inlineFragmentConditional = false;
    for (const selectionNode of selectionNodes) {
      // 1. Handle Field or Directtives selection nodes
      if ('kind' in selectionNode) {
        if (selectionNode.kind === 'Field') {
          if (selectionNode.selectionSet) {
            let selectedField: GraphQLField<any, any, any> = null;

            const fields = parentSchemaType.getFields();
            selectedField = fields[selectionNode.name.value];

            if (isMetadataFieldName(selectionNode.name.value)) {
              selectedField = metadataFieldMap[selectionNode.name.value];
            }

            if (!selectedField) {
              continue;
            }

            const fieldName = getFieldNodeNameValue(selectionNode);
            let linkFieldNode = linkFieldSelectionSets.get(fieldName);
            if (linkFieldNode) {
              linkFieldNode = {
                ...linkFieldNode,
                field: {
                  ...linkFieldNode.field,
                  selectionSet: mergeSelectionSets(linkFieldNode.field.selectionSet, selectionNode.selectionSet),
                },
              };
            } else {
              linkFieldNode = {
                selectedFieldType: selectedField.type,
                field: selectionNode,
              };
            }
            linkFieldSelectionSets.set(fieldName, linkFieldNode);
          } else if (selectionNode.alias) {
            primitiveAliasFields.set(selectionNode.alias.value, selectionNode);
          } else if (selectionNode.name.value === '__typename') {
            requireTypename = true;
          } else {
            primitiveFields.set(selectionNode.name.value, selectionNode);
          }
        } else if (selectionNode.kind === 'Directive') {
          if (['skip', 'include'].includes(selectionNode?.name?.value)) {
            inlineFragmentConditional = true;
          }
        } else {
          throw new TypeError('Unexpected type.');
        }
        continue;
      }

      // 2. Handle Fragment Spread nodes
      // A Fragment Spread can be:
      // - masked: the fields declared in the Fragment do not appear in the operation types
      // - inline: the fields declared in the Fragment appear in the operation types

      // 2a. If `inlineFragmentTypes` is 'combine' or 'mask', the Fragment Spread is masked by default
      // In some cases, a masked node could be unmasked (i.e. treated as inline):
      // - Fragment spread node is marked with Apollo `@unmask`, e.g. `...User @unmask`
      if (this._config.inlineFragmentTypes === 'combine' || this._config.inlineFragmentTypes === 'mask') {
        let isMasked = true;

        if (
          this._config.customDirectives.apolloUnmask &&
          selectionNode.fragmentDirectives.some(d => d.name.value === 'unmask')
        ) {
          isMasked = false;
        }

        if (isMasked) {
          fragmentsSpreadUsages.push(selectionNode.typeName);
          continue;
        }
      }

      // 2b. If the Fragment Spread is not masked, generate inline types.
      const fragmentType = this._schema.getType(selectionNode.onType);

      if (fragmentType == null) {
        throw new TypeError(`Unexpected error: Type ${selectionNode.onType} does not exist within schema.`);
      }

      if (
        parentSchemaType.name === selectionNode.onType ||
        parentSchemaType.getInterfaces().find(iinterface => iinterface.name === selectionNode.onType) != null ||
        (isUnionType(fragmentType) &&
          fragmentType.getTypes().find(objectType => objectType.name === parentSchemaType.name))
      ) {
        // also process fields from fragment that apply for this parentType
        const flatten = this.flattenSelectionSet(selectionNode.selectionNodes, parentSchemaType);
        const typeNodes = flatten.get(parentSchemaType.name) ?? [];
        selectionNodes.push(...typeNodes);
        for (const iinterface of parentSchemaType.getInterfaces()) {
          const typeNodes = flatten.get(iinterface.name) ?? [];
          selectionNodes.push(...typeNodes);
        }
      }
    }

    const linkFields: LinkField[] = [];
    const linkFieldsInterfaces: DependentType[] = [];
    for (const { field, selectedFieldType } of linkFieldSelectionSets.values()) {
      const realSelectedFieldType = getBaseType(selectedFieldType as any);
      const selectionSet = this.createNext(realSelectedFieldType, field.selectionSet);
      const fieldName = field.alias?.value ?? field.name.value;
      const selectionSetObjects = selectionSet.transformSelectionSet(
        options.parentFieldName ? `${options.parentFieldName}_${fieldName}` : fieldName
      );

      linkFieldsInterfaces.push(...selectionSetObjects.dependentTypes);
      const isConditional = hasConditionalDirectives(field) || inlineFragmentConditional;
      const isOptional = options.unsetTypes;
      linkFields.push({
        alias: field.alias
          ? this._processor.config.formatNamedField(field.alias.value, selectedFieldType, isConditional, isOptional)
          : undefined,
        name: this._processor.config.formatNamedField(field.name.value, selectedFieldType, isConditional, isOptional),
        type: realSelectedFieldType.name,
        selectionSet: this._processor.config.wrapTypeWithModifiers(
          selectionSetObjects.mergedTypeString.split(`\n`).join(`\n  `),
          selectedFieldType
        ),
      });
    }

    const typeInfoField = this.buildTypeNameField(
      parentSchemaType,
      this._config.nonOptionalTypename,
      this._config.addTypename,
      requireTypename,
      this._config.skipTypeNameForRoot
    );
    const transformed: ProcessResult = [
      // Only add the typename field if we're not merging fragment
      // types. If we are merging, we need to wait until we know all
      // the involved typenames.
      ...(typeInfoField && (!this._config.mergeFragmentTypes || this._config.inlineFragmentTypes === 'mask')
        ? this._processor.transformTypenameField(typeInfoField.type, typeInfoField.name)
        : []),
      ...this._processor.transformPrimitiveFields(
        parentSchemaType,
        Array.from(primitiveFields.values()).map(field => ({
          isConditional: hasConditionalDirectives(field),
          fieldName: field.name.value,
        })),
        options.unsetTypes
      ),
      ...this._processor.transformAliasesPrimitiveFields(
        parentSchemaType,
        Array.from(primitiveAliasFields.values()).map(field => ({
          alias: field.alias.value,
          fieldName: field.name.value,
          isConditional: hasConditionalDirectives(field),
        })),
        options.unsetTypes
      ),
      ...this._processor.transformLinkFields(linkFields, options.unsetTypes),
    ].filter(Boolean);

    const allStrings: string[] = transformed.filter(t => typeof t === 'string') as string[];

    const allObjectsMerged: string[] = transformed
      .filter(t => typeof t !== 'string')
      .map((t: NameAndType) => `${t.name}: ${t.type}`);

    let mergedObjectsAsString: string = null;

    if (allObjectsMerged.length > 0) {
      mergedObjectsAsString = this._processor.buildFieldsIntoObject(allObjectsMerged);
    }

    const fields = [...allStrings, mergedObjectsAsString].filter(Boolean);

    if (fragmentsSpreadUsages.length) {
      if (this._config.inlineFragmentTypes === 'combine') {
        fields.push(...fragmentsSpreadUsages);
      } else if (this._config.inlineFragmentTypes === 'mask') {
        fields.push(
          `{ ' $fragmentRefs'?: { ${fragmentsSpreadUsages
            .map(name => `'${name}': ${options.unsetTypes ? `Incremental<${name}>` : name}`)
            .join(`;`)} } }`
        );
      }
    }

    return { typeInfo: typeInfoField, fields, dependentTypes: linkFieldsInterfaces };
  }

  protected buildTypeNameField(
    type: GraphQLObjectType,
    nonOptionalTypename: boolean = this._config.nonOptionalTypename,
    addTypename: boolean = this._config.addTypename,
    queriedForTypename: boolean = this._queriedForTypename,
    skipTypeNameForRoot: boolean = this._config.skipTypeNameForRoot
  ): { name: string; type: string } {
    const rootTypes = getRootTypes(this._schema);
    if (rootTypes.has(type) && skipTypeNameForRoot && !queriedForTypename) {
      return null;
    }

    if (nonOptionalTypename || addTypename || queriedForTypename) {
      const optionalTypename = !queriedForTypename && !nonOptionalTypename;
      return {
        name: `${this._processor.config.formatNamedField('__typename')}${optionalTypename ? '?' : ''}`,
        type: `'${type.name}'`,
      };
    }

    return null;
  }

  protected getUnknownType(): string {
    return 'never';
  }

  protected getEmptyObjectType(): string {
    return `{}`;
  }

  private getEmptyObjectTypeString(mustAddEmptyObject: boolean): string {
    return mustAddEmptyObject ? this.getEmptyObjectType() : ``;
  }

  public transformSelectionSet(fieldName: string) {
    const possibleTypesList = getPossibleTypes(this._schema, this._parentSchemaType);
    const possibleTypes = possibleTypesList.map(v => v.name).sort();
    const fieldSelections = [
      ...getFieldNames({ selections: this._selectionSet.selections, loadedFragments: this._loadedFragments }),
    ].sort();

    // Optimization: Do not create new dependentTypes if fragment typename exists in cache
    // 2-layer cache: LOC => Field Selection Type Combination => cachedTypeString
    const objMap = this._processor.typeCache.get(this._selectionSet.loc) ?? new Map<string, [string, string]>();
    this._processor.typeCache.set(this._selectionSet.loc, objMap);

    const cacheHashKey = `${fieldSelections.join(',')} @ ${possibleTypes.join('|')}`;
    const [cachedTypeString] = objMap.get(cacheHashKey) ?? [];
    if (cachedTypeString) {
      // reuse previously generated type, as it is identical
      return {
        mergedTypeString: cachedTypeString,
        // there are no new dependent types, as this is a nth use of the same type
        dependentTypes: [],
      };
    }
    const result = this.transformSelectionSetUncached(fieldName);
    objMap.set(cacheHashKey, [result.mergedTypeString, fieldName]);
    if (this._selectionSet.loc) {
      this._processor.typeCache.set(this._selectionSet.loc, objMap);
    }
    return result;
  }

  private transformSelectionSetUncached(fieldName: string): {
    mergedTypeString: string;
    dependentTypes: DependentType[];
    isUnionType?: boolean;
  } {
    const { grouped, mustAddEmptyObject, dependentTypes: subDependentTypes } = this._buildGroupedSelections(fieldName);

    // This might happen in case we have an interface, that is being queries, without any GraphQL
    // "type" that implements it. It will lead to a runtime error, but we aim to try to reflect that in
    // build time as well.
    if (Object.keys(grouped).length === 0) {
      return {
        mergedTypeString: this.getUnknownType(),
        dependentTypes: subDependentTypes,
      };
    }

    const dependentTypes = Object.keys(grouped)
      .map(typeName => {
        const relevant = grouped[typeName].filter(Boolean);
        return relevant.map(objDefinition => {
          const name = fieldName ? `${fieldName}_${typeName}` : typeName;
          return {
            name,
            content: typeof objDefinition === 'string' ? objDefinition : objDefinition.union.join(' | '),
            isUnionType: !!(typeof objDefinition !== 'string' && objDefinition.union.length > 1),
          };
        });
      })
      .filter(pairs => pairs.length > 0);

    const typeParts = [
      ...dependentTypes.map(pair =>
        pair
          .map(({ name, content, isUnionType }) =>
            // unions need to be wrapped, as intersections have higher precedence
            this._config.extractAllFieldsToTypes ? name : isUnionType ? `(${content})` : content
          )
          .join(' & ')
      ),
      this.getEmptyObjectTypeString(mustAddEmptyObject),
    ].filter(Boolean);

    const content = typeParts.join(' | ');

    if (typeParts.length > 1 && this._config.extractAllFieldsToTypes) {
      return {
        mergedTypeString: fieldName,
        dependentTypes: [
          ...subDependentTypes,
          ...dependentTypes.flat(1),
          { name: fieldName, content, isUnionType: true },
        ],
      };
    }

    return {
      mergedTypeString: content,
      dependentTypes: [...subDependentTypes, ...dependentTypes.flat(1)],
      isUnionType: typeParts.length > 1,
    };
  }

  public transformFragmentSelectionSetToTypes(
    fragmentName: string,
    fragmentSuffix: string,
    declarationBlockConfig: DeclarationBlockConfig
  ): string {
    const mergedTypeString = this.buildFragmentTypeName(fragmentName, fragmentSuffix);
    const { grouped, dependentTypes } = this._buildGroupedSelections(mergedTypeString);

    const subTypes: DependentType[] = Object.keys(grouped).flatMap(typeName => {
      const possibleFields = grouped[typeName].filter(Boolean);
      const declarationName = this.buildFragmentTypeName(fragmentName, fragmentSuffix, typeName);

      if (possibleFields.length === 0) {
        if (!this._config.addTypename) {
          return [{ name: declarationName, content: this.getEmptyObjectType() }];
        }

        return [];
      }

      const flatFields = possibleFields.map(selectionObject => {
        if (typeof selectionObject === 'string') return { value: selectionObject };
        return { value: selectionObject.union.join(' | '), isUnionType: true };
      });

      const content =
        flatFields.length > 1
          ? flatFields.map(({ value, isUnionType }) => (isUnionType ? `(${value})` : value)).join(' & ')
          : flatFields.map(({ value }) => value).join(' & ');
      return {
        name: declarationName,
        content,
        isUnionType: false,
      };
    });

    const fragmentMaskPartial =
      this._config.inlineFragmentTypes === 'mask' ? ` & { ' $fragmentName'?: '${mergedTypeString}' }` : '';

    // TODO: unify with line 308 from base-documents-visitor
    const dependentTypesContent = this._config.extractAllFieldsToTypes
      ? dependentTypes.map(
          i =>
            new DeclarationBlock(declarationBlockConfig)
              .export(true)
              .asKind('type')
              .withName(i.name)
              .withContent(i.content).string
        )
      : [];

    if (subTypes.length === 1) {
      return [
        ...dependentTypesContent,
        new DeclarationBlock(declarationBlockConfig)
          .export()
          .asKind('type')
          .withName(mergedTypeString)
          .withContent(subTypes[0].content + fragmentMaskPartial).string,
      ].join('\n');
    }

    return [
      ...dependentTypesContent,
      ...subTypes.map(
        t =>
          new DeclarationBlock(declarationBlockConfig)
            .export(this._config.exportFragmentSpreadSubTypes)
            .asKind('type')
            .withName(t.name)
            .withContent(
              `${t.content}${
                this._config.inlineFragmentTypes === 'mask' ? ` & { ' $fragmentName'?: '${t.name}' }` : ''
              }`
            ).string
      ),
      new DeclarationBlock(declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(mergedTypeString)
        .withContent(subTypes.map(t => t.name).join(' | ')).string,
    ].join('\n');
  }

  protected buildFragmentTypeName(name: string, suffix: string, typeName = ''): string {
    return this._convertName(name, {
      useTypesPrefix: true,
      suffix: typeName && suffix ? `_${typeName}_${suffix}` : typeName ? `_${typeName}` : suffix,
    });
  }

  protected buildParentFieldName(typeName: string, parentName: string): string {
    // queries/mutations/fragments are guaranteed to be unique type names,
    // so we can skip affixing the field names with typeName
    return operationTypes.includes(typeName) ? parentName : `${parentName}_${typeName}`;
  }
}
