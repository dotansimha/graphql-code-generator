jest.mock('fs');
jest.unmock('handlebars');
import * as fs from 'fs';
import * as path from 'path';

import {loadFromPath, compileTemplate} from "../../src/loaders/template-loader";

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
      const returnValue = compileTemplate({models: [{}]}, 'template.handlebars');

      expect(returnValue).toBeDefined();
      expect(returnValue).toEqual(' TEST ');
    });
  });
});
