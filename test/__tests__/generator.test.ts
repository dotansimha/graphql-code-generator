jest.mock('fs');
import * as fs from 'fs';
import {loadFromPath, generateCode} from "../../src/generator";

describe('generator', () => {
  const template = '{{#if models}} TEST {{/if}}';

  beforeAll(() => {
    fs['__setMockFiles']({
      'template.handlebars': template
    })
  });

  describe('loadFromPath', () => {
    test('should the file content with a valid file', () => {
      const returnValue = loadFromPath('template.handlebars');

      expect(typeof returnValue).toEqual('string');
      expect(returnValue).toEqual(template);
    });

    test('should throw an error when template file does not exists', () => {
      expect(() => {
        loadFromPath('error.handlebars')
      }).toThrow();
    });
  });

  describe('generateCode', () => {
    test('should return the compiled string and use handlebars', () => {
      const returnValue = generateCode({models: [{}]}, 'template.handlebars');

      expect(returnValue).toBeDefined();
      expect(returnValue).toEqual(' TEST ');
    });
  });
});
