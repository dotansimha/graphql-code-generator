import { parse } from 'graphql';
import { isUsingTypes } from '../src/utils';

describe('isUsingTypes', () => {
  it('Should include fragments when they are not extenral', () => {
    const ast = parse(/* GraphQL */ `
      fragment UserFields on User {
        id
      }

      query user {
        ...UserFields
      }
    `);

    expect(isUsingTypes(ast, [])).toBeTruthy();
  });

  it('Should ignore fragments when they are extenral', () => {
    const ast = parse(/* GraphQL */ `
      fragment UserFields on User {
        id
      }

      query user {
        ...UserFields
      }
    `);

    expect(isUsingTypes(ast, ['UserFields'])).toBeFalsy();
  });
});
