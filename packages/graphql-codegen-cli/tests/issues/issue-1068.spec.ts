import { parseConfigFile } from '../../src/yml';
import { generate } from '../../src';

it('Issues 1068 - Cannot read property "onType" of undefined', async () => {
  const ymlConfig = parseConfigFile(`
schema: 
  - "
    type AuthState {
      authenticated: Boolean
      token: String
    }
    
    type Query {
      getAuthState: AuthState
    }
    
    type Mutation {
      changeAuthState: AuthState
    }
"
documents: "
    mutation ChangeAuthState {
      changeAuthState @client {
        ...authFragments
      }
    }
    
    fragment authStateFragment on AuthState {
      authenticated
      token
    }
"
overwrite: true
generates:
  output.tsx:
    plugins:
      - time
      - add: "// THIS IS A GENERATED FILE, DO NOT EDIT IT!"
      - typescript-common:
          interfacePrefix: "I"
      - typescript-client
      - typescript-react-apollo
  `);

  try {
    await generate(ymlConfig);
    expect(true).toBeFalsy();
  } catch (e) {
    expect(e.errors[0].message).toBe(
      `A fragment spread you used "authFragments" could not found. Please make sure that it's loaded as a GraphQL document!`
    );
  }
});
