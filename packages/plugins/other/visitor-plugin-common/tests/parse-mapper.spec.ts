import { parseMapper } from '../src/mappers';
describe('parseMapper', () => {
  it('Should return the correct values for a simple named mapper', () => {
    const result = parseMapper('MyType');

    expect(result).toEqual({
      isExternal: false,
      type: 'MyType',
    });
  });

  it('Should return the correct values for a external named mapper', () => {
    const result = parseMapper('file#MyType');

    expect(result).toEqual({
      default: false,
      isExternal: true,
      type: 'MyType',
      source: 'file',
    });
  });

  it('Should return the correct values for a external default mapper', () => {
    const result = parseMapper('file#default', 'MyGqlType');

    expect(result).toEqual({
      default: true,
      isExternal: true,
      type: 'MyGqlType',
      source: 'file',
    });
  });
});
