import { BaseJavaVisitor } from './base-java-visitor';
import { ParsedConfig, toPascalCase, indent, indentMultiline, getBaseType, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { buildPackageNameFromPath, JavaDeclarationBlock } from '@graphql-codegen/java-common';
import {
  GraphQLSchema,
  OperationDefinitionNode,
  print,
  Kind,
  GraphQLNamedType,
  GraphQLObjectType,
  SelectionNode,
  isNonNullType,
  GraphQLOutputType,
  isScalarType,
  isEnumType,
  InlineFragmentNode,
  isUnionType,
  isInterfaceType,
  isObjectType,
} from 'graphql';
import { JavaApolloAndroidPluginConfig } from './plugin';
import { Imports } from './imports';
import { createHash } from 'crypto';

export interface OperationVisitorConfig extends ParsedConfig {
  package: string;
  fragmentPackage: string;
}

export interface TransformSelectionSetOptions {
  className: string;
  schemaType: GraphQLNamedType;
  implements?: string[];
  selectionSet: ReadonlyArray<SelectionNode>;
  result: { [typeName: string]: JavaDeclarationBlock };
}

export class OperationVisitor extends BaseJavaVisitor<OperationVisitorConfig> {
  constructor(_schema: GraphQLSchema, rawConfig: JavaApolloAndroidPluginConfig, private _availableFragments: LoadedFragment[]) {
    super(_schema, rawConfig, {
      package: rawConfig.package || buildPackageNameFromPath(process.cwd()),
      fragmentPackage: rawConfig.fragmentPackage || 'fragment',
    });
  }

  private printOperation(node: OperationDefinitionNode): string {
    return print(node)
      .replace(/\r?\n|\r/g, ' ')
      .replace(/"/g, '\\"')
      .trim();
  }

  private buildCtor(className: string, node: OperationDefinitionNode): string {
    const variables = node.variableDefinitions || [];
    const hasVariables = variables.length > 0;
    const variablesArgs = (node.variableDefinitions || []).map(v => this.getFieldWithTypePrefix(v, null, true)).join(', ');
    const nonNullVariables = variables
      .filter(v => v.type.kind === Kind.NON_NULL_TYPE)
      .map(v => {
        this._imports.add(Imports.Utils);

        return indent(`Utils.checkNotNull(${v.variable.name.value}, "${v.variable.name.value} == null");`);
      })
      .join('\n');

    return indentMultiline(`public ${className}(${variablesArgs}) {
${nonNullVariables}      
  this.variables = ${!hasVariables ? 'Operation.EMPTY_VARIABLES' : `new ${className}.Variables(${variables.map(v => v.variable.name.value).join(', ')})`};
}`);
  }

  private getRootType(operation: string): GraphQLObjectType {
    if (operation === 'query') {
      return this._schema.getQueryType();
    } else if (operation === 'mutation') {
      return this._schema.getMutationType();
    } else if (operation === 'subscription') {
      return this._schema.getSubscriptionType();
    } else {
      return null;
    }
  }

  private createUniqueClassName(inUse: string[], name: string, count = 0): string {
    const possibleNewName = count === 0 ? name : `${name}${count}`;

    while (inUse.includes(possibleNewName)) {
      return this.createUniqueClassName(inUse, name, count + 1);
    }

    return possibleNewName;
  }

  // private getReaderMethod(schemaType: GraphQLNamedType): string {
  //   if (isScalarType(schemaType)) {
  //     return SCALAR_TO_READER_METHOD[schemaType.name] || 'writeCustom';
  //   } else if (isInputObjectType(schemaType)) {
  //     return listItemCall ? `writeObject($item.marshaller())` : `writeObject("${field.name.value}", ${field.name.value}.value != null ? ${field.name.value}.value.marshaller() : null)`;
  //   } else if (isEnumType(schemaType)) {
  //     writerMethod = 'writeString';
  //   }
  // }

  private transformSelectionSet(options: TransformSelectionSetOptions, isRoot = true) {
    if (!options.result) {
      options.result = {};
    }

    if (!isObjectType(options.schemaType) && !isInterfaceType(options.schemaType)) {
      return options.result;
    }

    const className = this.createUniqueClassName(Object.keys(options.result), options.className);
    const cls = new JavaDeclarationBlock()
      .access('public')
      .static()
      .asKind('class')
      .withName(className)
      .implements(options.implements || []);

    options.result[className] = cls;

    const fields = options.schemaType.getFields();
    const childFields: { isNonNull: boolean; annotation: string; className: string; fieldName: string }[] = [];
    const childInlineFragments: { onType: string; node: InlineFragmentNode }[] = [];
    const childFragmentSpread: LoadedFragment[] = [];

    const selections = [...(options.selectionSet || [])];
    const responseFieldArr: string[] = [];

    for (const selection of selections) {
      if (selection.kind === Kind.FIELD) {
        this._imports.add(Imports.ResponseField);
        const field = fields[selection.name.value];
        const isObject = selection.selectionSet && selection.selectionSet.selections && selection.selectionSet.selections.length > 0;
        const isNonNull = isNonNullType(field.type);
        const fieldAnnotation = isNonNull ? 'Nonnull' : 'Nullable';

        if (isObject) {
          const childClsName = this.convertName(field.name);
          this.transformSelectionSet(
            {
              className: childClsName,
              result: options.result,
              selectionSet: selection.selectionSet.selections,
              schemaType: getBaseType(field.type) as GraphQLObjectType,
            },
            false
          );

          childFields.push({
            isNonNull,
            annotation: fieldAnnotation,
            className: childClsName,
            fieldName: field.name,
          });
        } else {
          const javaClass = this.getActualType(getBaseType(field.type));

          childFields.push({
            isNonNull,
            annotation: fieldAnnotation,
            className: javaClass,
            fieldName: field.name,
          });
        }

        this._imports.add(Imports.ResponseField);
        this._imports.add(Imports.Collections);

        // TODO: resolve variables
        const variables = 'null';
        const responseFieldMethod = this._resolveResponseFieldMethod(field.type);

        responseFieldArr.push(
          `ResponseField.${responseFieldMethod}("${selection.alias ? selection.alias.value : selection.name.value}", "${selection.name.value}", ${variables}, ${!isNonNullType(field.type)}, Collections.<ResponseField.Condition>emptyList())`
        );
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        if (isUnionType(options.schemaType) || isInterfaceType(options.schemaType)) {
          childInlineFragments.push({
            onType: selection.typeCondition.name.value,
            node: selection,
          });
        } else {
          selections.push(...selection.selectionSet.selections);
        }
      } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
        const fragment = this._availableFragments.find(f => f.name === selection.name.value);

        if (fragment) {
          childFragmentSpread.push(fragment);
          this._imports.add(`${this.config.fragmentPackage}.${fragment.name}`);
        } else {
          throw new Error(`Fragment with name ${selection.name.value} was not loaded as document!`);
        }
      }
    }

    if (childInlineFragments.length > 0) {
      childFields.push(
        ...childInlineFragments.map(inlineFragment => {
          const cls = `As${inlineFragment.onType}`;

          this.transformSelectionSet(
            {
              className: cls,
              result: options.result,
              selectionSet: inlineFragment.node.selectionSet.selections,
              schemaType: this._schema.getType(inlineFragment.onType),
            },
            false
          );

          return {
            isNonNull: false,
            annotation: 'Nullable ',
            className: cls,
            fieldName: `as${inlineFragment.onType}`,
          };
        })
      );

      responseFieldArr.push(...childInlineFragments.map(f => `ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("${f.onType}"))`));
    }

    if (childFragmentSpread.length > 0) {
      responseFieldArr.push(`ResponseField.forFragment("__typename", "__typename", Arrays.asList(${childFragmentSpread.map(f => `"${f.onType}"`).join(', ')}))`);

      childFields.push({
        isNonNull: true,
        annotation: 'Nonnull',
        className: 'Fragments',
        fieldName: 'fragments',
      });

      // TODO: fragments class
      const fragmentsClass = '';
    }

    if (responseFieldArr.length > 0 && !isRoot) {
      responseFieldArr.unshift(`ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList())`);
    }

    if (!isRoot) {
      childFields.unshift({
        isNonNull: true,
        annotation: 'Nonnull',
        className: 'String',
        fieldName: '__typename',
      });
    }

    // Add members
    childFields.forEach(c => {
      cls.addClassMember(c.fieldName, c.className, null, [c.annotation], 'private', { final: true });
    });

    // Add $toString, $hashCode, $hashCodeMemoized
    cls.addClassMember('$toString', 'String', null, [], 'private', { volatile: true });
    cls.addClassMember('$hashCode', 'int', null, [], 'private', { volatile: true });
    cls.addClassMember('$hashCodeMemoized', 'boolean', null, [], 'private', { volatile: true });
    // Add responseFields for all fields
    cls.addClassMember('$responseFields', 'ResponseField[]', `{\n${indentMultiline(responseFieldArr.join(',\n'), 2) + '\n  }'}`, [], null, { static: true, final: true });
    // Add Ctor
    cls.addClassMethod(
      className,
      null,
      childFields.map(c => `this.${c.fieldName} = ${c.isNonNull ? `Utils.checkNotNull(${c.fieldName}, "${c.fieldName} == null")` : c.fieldName};`).join('\n'),
      childFields.map(c => ({ name: c.fieldName, type: c.className, annotations: [c.annotation] })),
      null,
      'public'
    );

    // Add getters for all members
    childFields.forEach(c => {
      cls.addClassMethod(c.fieldName, c.className, `return this.${c.fieldName};`, [], [c.annotation], 'public', {});
    });

    // Add .toString()
    cls.addClassMethod(
      'toString',
      'String',
      `if ($toString == null) {
  $toString = "${className}{"
${childFields.map(c => indent(`+ "${c.fieldName}=" + ${c.fieldName} + ", "`, 2)).join('\n')}
    + "}";
}

return $toString;`,
      [],
      [],
      'public',
      {},
      ['Override']
    );

    // Add equals
    cls.addClassMethod(
      'equals',
      'boolean',
      `if (o == this) {
  return true;
}
if (o instanceof ${className}) {
  ${className} that = (${className}) o;
  return ${childFields.map(c => (c.isNonNull ? `this.${c.fieldName}.equals(that.${c.fieldName})` : `((this.${c.fieldName} == null) ? (that.${c.fieldName} == null) : this.${c.fieldName}.equals(that.${c.fieldName}))`)).join(' && ')};
}

return false;`,
      [],
      [],
      'public',
      {},
      ['Override']
    );

    // hashCode
    cls.addClassMethod(
      'hashCode',
      'int',
      `if (!$hashCodeMemoized) {
  int h = 1;
${childFields.map(f => indentMultiline(`h *= 1000003;\nh ^= ${!f.isNonNull ? `(${f.fieldName} == null) ? 0 : ` : ''}${f.fieldName}.hashCode();`, 1)).join('\n')}
  $hashCode = h;
  $hashCodeMemoized = true;
}

return $hashCode;`,
      [],
      [],
      'public',
      {},
      ['Override']
    );

    this._imports.add(Imports.ResponseReader);

    // TODO: Finish impl
    cls.nestedClass(
      new JavaDeclarationBlock()
        .access('public')
        .static()
        .final()
        .asKind('class')
        .withName('Mapper')
        .implements([`ResponseFieldMapper<${className}>`])
        .addClassMethod(
          'map',
          className,
          '',
          [
            {
              name: 'reader',
              type: 'ResponseReader',
            },
          ],
          [],
          'public',
          {},
          ['Override']
        )
    );

    return options.result;
  }

  private _resolveResponseFieldMethod(type: GraphQLOutputType): string {
    const baseType = getBaseType(type);

    return this._resolveResponseFieldMethodForBaseType(baseType);
  }

  private _resolveResponseFieldMethodForBaseType(baseType: GraphQLNamedType): string {
    if (isScalarType(baseType)) {
      if (baseType.name === 'String') {
        return `forString`;
      } else if (baseType.name === 'Int') {
        return `forInt`;
      } else if (baseType.name === 'Float') {
        return `forDouble`;
      } else if (baseType.name === 'Boolean') {
        return `forBoolean`;
      } else {
        return `forCustomType`;
      }
    } else if (isEnumType(baseType)) {
      return `forEnum`;
    } else {
      return `forObject`;
    }
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const operationType = toPascalCase(node.operation);
    const operationSchemaType = this.getRootType(node.operation);
    const className = node.name.value.endsWith(operationType) ? operationType : `${node.name.value}${operationType}`;
    this._imports.add(Imports[operationType]);
    this._imports.add(Imports.String);
    this._imports.add(Imports.Override);
    this._imports.add(Imports.Generated);
    this._imports.add(Imports.OperationName);
    this._imports.add(Imports.ResponseFieldMapper);

    const printedOperation = this.printOperation(node);
    const cls = new JavaDeclarationBlock()
      .annotate([`Generated("Apollo GraphQL")`])
      .access('public')
      .final()
      .asKind('class')
      .withName(className)
      .implements([`${operationType}<${className}.Data, ${className}.Data, ${className}.Variables>`]);

    cls.addClassMember('OPERATION_DEFINITION', 'String', `"${printedOperation}"`, [], 'public', { static: true, final: true });
    cls.addClassMember('QUERY_DOCUMENT', 'String', 'OPERATION_DEFINITION', [], 'public', { static: true, final: true });
    cls.addClassMember(
      'OPERATION_NAME',
      'OperationName',
      `new OperationName() {
  @Override
  public String name() {
    return "${node.name.value}";
  }
}`,
      [],
      'public',
      { static: true, final: true }
    );
    cls.addClassMember('variables', `${className}.Variables`, null, [], 'private', { final: true });

    const ctor = this.buildCtor(className, node);
    const operationId = indentMultiline(`@Override
public String operationId() {
  return "${createHash('md5')
    .update(printedOperation)
    .digest('hex')}";
}`);
    const mixedDeclarations = indentMultiline(`@Override
public String queryDocument() {
  return QUERY_DOCUMENT;
}

@Override
public ${className}.Data wrapData(${className}.Data data) {
  return data;
}

@Override
public ${className}.Variables variables() {
  return variables;
}

@Override
public ResponseFieldMapper<${className}.Data> responseFieldMapper() {
  return new Data.Mapper();
}

public static Builder builder() {
  return new Builder();
}

@Override
public OperationName name() {
  return OPERATION_NAME;
}`);

    const dataClasses = this.transformSelectionSet({
      className: 'Data',
      implements: ['Operation.Data'],
      selectionSet: node.selectionSet && node.selectionSet.selections ? node.selectionSet.selections : [],
      result: {},
      schemaType: operationSchemaType,
    });

    Object.keys(dataClasses).forEach(className => {
      cls.nestedClass(dataClasses[className]);
    });

    const block = [ctor, operationId, mixedDeclarations].join('\n\n');

    cls.withBlock(block);

    return cls.string;
  }
}
