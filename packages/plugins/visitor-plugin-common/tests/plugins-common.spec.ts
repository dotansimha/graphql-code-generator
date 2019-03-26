import { convertFactory } from '../src/naming';

describe('convertFactory', () => {
  it('Should use pascal case by default', () => {
    const factory = convertFactory({
      namingConvention: null,
    });

    expect(factory('MyName')).toBe('MyName');
    expect(factory('myName')).toBe('MyName');
    expect(factory('myname')).toBe('Myname');
    expect(factory('MyNAME')).toBe('MyName');
  });

  it('Should allow to use "keep" as root', () => {
    const factory = convertFactory({
      namingConvention: 'keep',
    });

    expect(factory('MyName')).toBe('MyName');
    expect(factory('myName')).toBe('myName');
    expect(factory('myname')).toBe('myname');
    expect(factory('MyNAME')).toBe('MyNAME');
  });

  it('Should allow to use Function as root', () => {
    const factory = convertFactory({
      namingConvention: str => {
        return 'something' + str;
      },
    });

    expect(factory('MyName')).toBe('somethingMyName');
  });

  it('Should allow to use object of naming conventions', () => {
    const factory = convertFactory({
      namingConvention: {
        typeNames: 'keep',
        enumValues: 'keep',
      },
    });

    expect(factory('MyName')).toBe('MyName');
    expect(factory('Myname')).toBe('Myname');
    expect(factory('NYNAME')).toBe('NYNAME');
  });

  it('Should allow to use function of naming conventions', () => {
    const factory = convertFactory({
      namingConvention: {
        typeNames: str => 'a_' + str,
        enumValues: 'keep',
      },
    });

    expect(factory('MyName')).toBe('a_MyName');
    expect(factory('Myname')).toBe('a_Myname');
    expect(factory('NYNAME')).toBe('a_NYNAME');
  });

  it('Should allow to use function of naming conventions', () => {
    const factory = convertFactory({
      namingConvention: {
        typeNames: str => 'a_' + str,
        enumValues: 'keep',
      },
    });

    expect(factory('MyName')).toBe('a_MyName');
    expect(factory('Myname')).toBe('a_Myname');
    expect(factory('NYNAME')).toBe('a_NYNAME');
  });

  it('Should keep underscore by default', () => {
    const factory = convertFactory({
      namingConvention: null,
    });

    expect(factory('My_Name')).toBe('My_Name');
    expect(factory('_Myname')).toBe('_Myname');
    expect(factory('My_name')).toBe('My_Name');
  });

  it('Should allow to override underscore behaviour', () => {
    const factory = convertFactory({
      namingConvention: null,
    });

    expect(factory('My_Name', { transformUnderscore: true })).toBe('MyName');
    expect(factory('_Myname', { transformUnderscore: true })).toBe('Myname');
    expect(factory('My_name', { transformUnderscore: true })).toBe('MyName');
  });
});
