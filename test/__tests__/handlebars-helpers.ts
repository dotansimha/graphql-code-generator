jest.mock('handlebars');
import * as handlebars from 'handlebars';

import {initHelpers} from "../../src/handlebars-helpers";

describe('handlebars-helpers', () => {
  test('should register all helpers', () => {
    initHelpers();

    expect(Object.keys(handlebars['__getHelpers'])).toEqual([])
  });
});