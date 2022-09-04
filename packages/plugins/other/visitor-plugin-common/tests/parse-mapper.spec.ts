import { parseMapper, transformMappers } from '../src/mappers.js';

describe('parseMapper', () => {
  it('Should return the correct values for a simple named mapper', () => {
    const result = parseMapper('MyType');

    expect(result).toEqual({
      isExternal: false,
      type: 'MyType',
    });
  });

  it('Should support a custom mapper with no imports', () => {
    const result = parseMapper('CustomMergeTypeMapper<SomeType, SomeOtherType>', 'SomeType');

    expect(result).toEqual({
      isExternal: false,
      type: 'CustomMergeTypeMapper<SomeType, SomeOtherType>',
    });
  });

  it('Should return the correct values for a external named mapper', () => {
    const result = parseMapper('file#MyType');

    expect(result).toEqual({
      default: false,
      isExternal: true,
      import: 'MyType',
      type: 'MyType',
      source: 'file',
    });
  });

  it('Should return the correct values for a external default mapper', () => {
    const result = parseMapper('file#default', 'MyGqlType');

    expect(result).toEqual({
      default: true,
      isExternal: true,
      import: 'MyGqlType',
      type: 'MyGqlType',
      source: 'file',
    });
  });

  it('Should support namespaces', () => {
    const result = parseMapper('file#Namespace.Type', 'MyGqlType');

    expect(result).toEqual({
      default: false,
      isExternal: true,
      import: 'Namespace',
      type: 'Namespace.Type',
      source: 'file',
    });

    // legacy
    const legacyResult = parseMapper('file#Namespace#Type', 'MyGqlType');

    expect(legacyResult).toEqual({
      default: false,
      isExternal: true,
      import: 'Namespace',
      type: 'Namespace.Type',
      source: 'file',
    });
  });

  it('Should support aliases', () => {
    const result = parseMapper('file#Type as SomeOtherType', 'SomeType');

    expect(result).toEqual({
      default: false,
      isExternal: true,
      import: 'Type as SomeOtherType',
      type: 'SomeOtherType',
      source: 'file',
    });
  });

  it('Should support aliases (default)', () => {
    const result = parseMapper('file#default as SomeOtherType', 'SomeType');

    expect(result).toEqual({
      default: true,
      isExternal: true,
      import: 'SomeOtherType',
      type: 'SomeOtherType',
      source: 'file',
    });
  });

  it('should support generic with complex setup', () => {
    const result = parseMapper(`@common-types#Edge<ResolversParentTypes['User']>`, 'SomeType');

    expect(result).toEqual({
      default: false,
      isExternal: true,
      import: 'Edge',
      type: `Edge<ResolversParentTypes['User']>`,
      source: '@common-types',
    });
  });

  it('Should support generics', () => {
    const result = parseMapper('file#Type<Generic>', 'SomeType');

    expect(result).toEqual({
      default: false,
      isExternal: true,
      import: 'Type',
      type: 'Type<Generic>',
      source: 'file',
    });
  });

  describe('suffix', () => {
    it('Should not add a suffix to a simple named mapper', () => {
      const result = parseMapper('MyType', null, 'Model');

      expect(result).toEqual({
        isExternal: false,
        type: 'MyType',
      });
    });

    it('Should add a suffix to an external named mapper', () => {
      const result = parseMapper('file#Type', null, 'Model');

      expect(result).toEqual({
        default: false,
        isExternal: true,
        import: 'Type as TypeModel',
        type: 'TypeModel',
        source: 'file',
      });
    });

    it('Should add a suffix to an external default mapper', () => {
      const result = parseMapper('file#default', 'MyGqlType', 'Model');

      expect(result).toEqual({
        default: true,
        isExternal: true,
        import: 'MyGqlTypeModel',
        type: 'MyGqlTypeModel',
        source: 'file',
      });
    });

    it('Should add a suffix and support generics', () => {
      const result = parseMapper('file#Type<Generic>', 'SomeType', 'Model');

      expect(result).toEqual({
        default: false,
        isExternal: true,
        import: 'Type as TypeModel',
        type: 'TypeModel<Generic>',
        source: 'file',
      });
    });

    it('Should not add a suffix to a namespace', () => {
      const result = parseMapper('file#Namespace.Type', 'MyGqlType', 'Model');

      expect(result).toEqual({
        default: false,
        isExternal: true,
        import: 'Namespace',
        type: 'Namespace.Type',
        source: 'file',
      });

      // legacy
      const legacyResult = parseMapper('file#Namespace#Type', 'MyGqlType', 'Model');

      expect(legacyResult).toEqual({
        default: false,
        isExternal: true,
        import: 'Namespace',
        type: 'Namespace.Type',
        source: 'file',
      });
    });

    it('Should add a suffix next to an alias', () => {
      const result = parseMapper('file#Type as SomeOtherType', 'SomeType', 'Model');

      expect(result).toEqual({
        default: false,
        isExternal: true,
        import: 'Type as SomeOtherTypeModel',
        type: 'SomeOtherTypeModel',
        source: 'file',
      });
    });

    it('transformMappers should apply a suffix to parseMapper', () => {
      const mappers = transformMappers(
        {
          Type: 'file#Type as SomeOtherType',
        },
        'Suffix'
      );

      const result = mappers.Type;

      expect(result).toEqual({
        default: false,
        isExternal: true,
        import: 'Type as SomeOtherTypeSuffix',
        type: 'SomeOtherTypeSuffix',
        source: 'file',
      });
    });
  });
});
