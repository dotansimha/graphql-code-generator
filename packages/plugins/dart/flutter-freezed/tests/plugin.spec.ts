import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { DefaultFreezedPluginConfig, getFreezedConfigValue } from '../src/utils';

describe('flutter-freezed', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Movie {
      id: ID!
      title: String!
    }

    input CreateMovieInput {
      title: String!
    }

    input UpsertMovieInput {
      id: ID!
      title: String!
    }

    input UpdateMovieInput {
      id: ID!
      title: String
    }

    input DeleteMovieInput {
      id: ID!
    }

    enum Episode {
      NEWHOPE
      EMPIRE
      JEDI
    }

    type Starship {
      id: ID!
      name: String!
      length: Float
    }

    interface Character {
      id: ID!
      name: String!
      friends: [Character]
      appearsIn: [Episode]!
    }

    type MovieCharacter {
      name: String!
      appearsIn: [Episode]!
    }

    type Human implements Character {
      id: ID!
      name: String!
      friends: [MovieCharacter]
      appearsIn: [Episode]!
      starships: [Starship]
      totalCredits: Int
    }

    type Droid implements Character {
      id: ID!
      name: String!
      friends: [MovieCharacter]
      appearsIn: [Episode]!
      primaryFunction: String
    }

    union SearchResult = Human | Droid | Starship

    # tests

    scalar UUID
    scalar timestamptz
    scalar jsonb

    # cyclic references/nested types
    input AInput {
      b: BInput!
    }

    input BInput {
      c: CInput!
    }

    input CInput {
      a: AInput!
    }

    type ComplexType {
      a: [String]
      b: [ID!]
      c: [Boolean!]!
      d: [[Int]]
      e: [[Float]!]
      f: [[String]!]!
      g: jsonb
      h: timestamptz!
      i: UUID!
    }
  `);

  const unionSchema = buildSchema(/* GraphQL */ `
    enum Episode {
      NEWHOPE
      EMPIRE
      JEDI
    }

    type Starship {
      id: ID!
      name: String!
      length: Float
    }

    interface Character {
      id: ID!
      name: String!
      friends: [Character]
      appearsIn: [Episode]!
    }

    type MovieCharacter {
      name: String!
      appearsIn: [Episode]!
    }

    type Human implements Character {
      id: ID!
      name: String!
      friends: [MovieCharacter]
      appearsIn: [Episode]!
      starships: [Starship]
      totalCredits: Int
    }

    type Droid implements Character {
      id: ID!
      name: String!
      friends: [MovieCharacter]
      appearsIn: [Episode]!
      primaryFunction: String
    }

    union SearchResult = Human | Droid | Starship
  `);

  it('Should greet', async () => {
    const result = await plugin(unionSchema, [], {});

    expect(result).toBe('Hi');
  });
});

describe('get freezed config value', () => {
  const config = new DefaultFreezedPluginConfig({
    typeSpecificFreezedConfig: {
      Starship: {
        config: {
          immutable: false,
        },
      },
    },
  });

  it('should return the typeSpecific config value', () => {
    expect(getFreezedConfigValue('immutable', config, 'Starship')).toBe(false);
  });

  /*   it('should return the default value', () => {
      expect(getConfigValue(config, 'directiveMap')).toBe([]);
    });

    it('should return the default value', () => {
      expect(getConfigValue(config, 'fileName')).toBe('app_models');
    });

    it('should return the default value', () => {
      expect(getConfigValue(config, 'globalFreezedConfig')).toBeInstanceOf(DefaultFreezedConfig);
    });

    it('should return the default value', () => {
      expect(getConfigValue(config, 'typeSpecificFreezedConfig')).toBe({});
    });

    it('should return the default value', () => {
      expect(getConfigValue(config, 'ignoreTypes')).toBe([]);
    });

    it('should return the default value', () => {
      expect(getConfigValue(config, 'interfaceNamePrefix')).toBe('');
    });

    it('should return the default value', () => {
      expect(getConfigValue(config, 'interfaceNameSuffix')).toBe('Interface');
    });

    it('should return the default value', () => {
      expect(getConfigValue(config, 'lowercaseEnums')).toBeTruthy();
    });

    it('should return the default value', () => {
      expect(getConfigValue(config, 'modular')).toBeTruthy();
    }); */

  it('should return the default value', () => {
    expect(getFreezedConfigValue('immutable', config, 'Spaceship')).toBe(true);
  });
});
