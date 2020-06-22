import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';

describe('C#', () => {
  describe('Using directives', () => {
    it('Should include dotnet using directives', async () => {
      const result = await plugin(
        buildSchema(`
        enum ns { dummy }
      `),
        [],
        {},
        { outputFile: '' }
      );

      expect(result).toContain('using System;');
      expect(result).toContain('using System.Collections.Generic;');
      expect(result).toContain('using Newtonsoft.Json;');
      expect(result).toContain('using GraphQL;');
    });
  });

  describe('Namespaces', () => {
    it('Should wrap generated code block in namespace', async () => {
      const result = await plugin(
        buildSchema(`
        enum ns { dummy }
      `),
        [],
        {},
        { outputFile: '' }
      );
      expect(result).toContain('namespace GraphQLCodeGen {');
    });
  });

  describe('Enums', () => {
    describe('Basic conversion', () => {
      const enumSchema = buildSchema(`
        enum UserRole {
          ADMIN
          USER
        }
      `);

      it('Should convert enums to C# enums', async () => {
        const result = await plugin(enumSchema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`
          public enum UserRole {
            ADMIN,
            USER
          }
        `);
      });

      it('Should allow to override enum values with custom values', async () => {
        const result = await plugin(
          enumSchema,
          [],
          {
            enumValues: {
              UserRole: {
                ADMIN: 'AdminRoleValue',
              },
            },
          },
          { outputFile: '' }
        );

        expect(result).toContain('AdminRoleValue');
        expect(result).toContain('USER');
      });
    });

    describe('Comment and directives', () => {
      const enumSchema = buildSchema(`
        """ Allowed user roles """
        enum UserRole {
          """ Administrator role """
          admin
          """ 
          User role 
          Note: normal users
          """
          user
          guest @deprecated (reason: "Guests not welcome")
        }
      `);

      it('Should generate summary header for the enum type', async () => {
        const result = await plugin(enumSchema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`
          /// <summary>
          /// Allowed user roles
          /// </summary>
          public enum UserRole
        `);
      });

      it('Should generate summary header for enum values', async () => {
        const result = await plugin(enumSchema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`
          /// <summary>
          /// Administrator role
          /// </summary>
          admin
        `);
        expect(result).toBeSimilarStringTo(`
          /// <summary>
          /// User role 
          /// Note: normal users
          /// </summary>
          user
        `);
      });

      it('Should mark deprecated enum values with Obsolete attribute', async () => {
        const result = await plugin(enumSchema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`[Obsolete("Guests not welcome")]
          guest
        `);
      });
    });
  });

  describe('Input Types', () => {
    const inputSchema = buildSchema(`
      input UserInput {
        id: Int
        email: String
      }
    `);

    it('Should generate C# class for input type', async () => {
      const result = await plugin(inputSchema, [], {}, { outputFile: '' });
      expect(result).toContain('public class UserInput {');
    });

    it('Should generate properties for input type fields', async () => {
      const result = await plugin(inputSchema, [], {}, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`
        public int? id { get; set; }
        public string email { get; set; }
      `);
    });

    it('Should generate C# method for creating input object', async () => {
      const result = await plugin(inputSchema, [], {}, { outputFile: '' });
      expect(result).toContain('public dynamic GetInputObject()');
    });

    it('Should generate summary header for class and properties', async () => {
      const result = await plugin(
        buildSchema(`
        """ User Input values """
        input UserInput {
          """ User id """
          id: Int!
        }
      `),
        [],
        {},
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
        /// <summary>
        /// User Input values
        /// </summary>
        public class UserInput {
      `);
      expect(result).toBeSimilarStringTo(`
        /// <summary>
        /// User id
        /// </summary>
        [JsonRequired]
        public int id { get; set; }
      `);
    });
  });

  describe('Types', () => {
    const typeSchema = buildSchema(`
      type User {
        id: Int
        email: String
      }
    `);

    it('Should generate C# class for type', async () => {
      const result = await plugin(typeSchema, [], {}, { outputFile: '' });
      expect(result).toContain('public class User {');
    });

    it('Should wrap generated classes in Type class', async () => {
      const result = await plugin(typeSchema, [], {}, { outputFile: '' });
      expect(result).toContain('public class Types {');
    });

    it('Should wrap generated classes in custom Type class name', async () => {
      const result = await plugin(typeSchema, [], { className: 'MyGqlTypes' }, { outputFile: '' });
      expect(result).toContain('public class MyGqlTypes {');
    });

    it('Should generate properties for types', async () => {
      const result = await plugin(typeSchema, [], {}, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`
        [JsonProperty("id")]
        public int? id { get; set; }
        [JsonProperty("email")]
        public string email { get; set; }
      `);
    });

    it('Should generate summary header for class and properties', async () => {
      const result = await plugin(
        buildSchema(`
        """ User values """
        type User {
          """ User id """
          id: Int!
        }
      `),
        [],
        {},
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
        /// <summary>
        /// User values
        /// </summary>
        public class User {
      `);
      expect(result).toBeSimilarStringTo(`
        /// <summary>
        /// User id
        /// </summary>
        [JsonProperty("id")]
        public int id { get; set; }
      `);
    });

    it('Should mark deprecated properties with Obsolete attribute', async () => {
      const result = await plugin(
        buildSchema(`
        type User {
          age: Int @deprecated
          ref: String @deprecated(reason: "Field is obsolete, use id")
        }
      `),
        [],
        {},
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
        [Obsolete("Field no longer supported")]
        [JsonProperty("age")]
        public int? age { get; set; }
      `);
      expect(result).toBeSimilarStringTo(`
        [Obsolete("Field is obsolete, use id")]
        [JsonProperty("ref")]
        public string ref { get; set; }      
      `);
    });
  });

  describe('GraphQL Value Types', () => {
    describe('Scalar', () => {
      it('Should generate properties for mandatory scalar types', async () => {
        const result = await plugin(
          buildSchema(`
          input BasicTypeInput {
            intReq: Int!
            fltReq: Float!
            idReq: ID!
            strReq: String!
            boolReq: Boolean!
          }
        `),
          [],
          { listType: 'IEnumerable' },
          { outputFile: '' }
        );

        expect(result).toBeSimilarStringTo(`
          [JsonRequired]
          public int intReq { get; set; }
          [JsonRequired]
          public float fltReq { get; set; }
          [JsonRequired]
          public string idReq { get; set; }
          [JsonRequired]
          public string strReq { get; set; }
          [JsonRequired]
          public bool boolReq { get; set; }
        `);
      });

      it('Should generate properties for optional scalar types', async () => {
        const result = await plugin(
          buildSchema(`
          input BasicTypeInput {
            intOpt: Int
            fltOpt: Float
            idOpt: ID
            strOpt: String
            boolOpt: Boolean
          }
        `),
          [],
          { listType: 'IEnumerable' },
          { outputFile: '' }
        );

        expect(result).toBeSimilarStringTo(`
          public int? intOpt { get; set; }
          public float? fltOpt { get; set; }
          public string idOpt { get; set; }
          public string strOpt { get; set; }
          public bool? boolOpt { get; set; }
        `);
      });
    });

    describe('Array', () => {
      const inputSchema = buildSchema(`
        input ArrayInput {
          arr1: [ Int! ]
          arr2: [ Float ]
          arr3: [ Int ]!
          arr4: [ Boolean! ]!
        }
      `);

      it('Should use default list type for arrays', async () => {
        const result = await plugin(inputSchema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo('public List<int> arr1 { get; set; }');
      });

      it('Should use custom list type for arrays when listType is specified', async () => {
        const result1 = await plugin(inputSchema, [], { listType: 'IEnumerable' }, { outputFile: '' });
        expect(result1).toContain('public IEnumerable<int> arr1 { get; set; }');

        const result2 = await plugin(inputSchema, [], { listType: 'HashSet' }, { outputFile: '' });
        expect(result2).toContain('public HashSet<int> arr1 { get; set; }');
      });

      it('Should use correct array inner types', async () => {
        const result = await plugin(inputSchema, [], { listType: 'IEnumerable' }, { outputFile: '' });

        expect(result).toBeSimilarStringTo(`
          public IEnumerable<int> arr1 { get; set; }
          public IEnumerable<float?> arr2 { get; set; }
          [JsonRequired]
          public IEnumerable<int?> arr3 { get; set; }
          [JsonRequired]
          public IEnumerable<bool> arr4 { get; set; }
        `);
      });
    });
  });

  describe('Initial Values', () => {
    it('Should generate correct initial values for basic types', async () => {
      const result = await plugin(
        buildSchema(`
        enum Length { None, Short, Long }
        input InitialInput {
          val: Int = 5
          flt: Float = 3.1415
          str: ID = "Dummy string"
          flag: Boolean = true
          hair: Length = Short
        }
      `),
        [],
        { listType: 'HashSet' },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
        public int? val { get; set; } = 5;
        public float? flt { get; set; } = 3.1415f;
        public string str { get; set; } = "Dummy string";
        public bool? flag { get; set; } = true;
        public Length? hair { get; set; } = Length.Short;
      `);
    });

    it('Should generate correct initial values for arrays', async () => {
      const result = await plugin(
        buildSchema(`
        input InitialInput {
          arr1: [ Int ] = [ null, 2, 3 ]
          arr2: [ Int! ] = [ 1, 2, 3 ]
          arr3: [ String ]! = [ "a", null, "c" ]
          arr4: [ String! ]! = [ "a", "b", "c" ]
        }
      `),
        [],
        { listType: 'HashSet' },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
        public HashSet<int?> arr1 { get; set; } = new HashSet<int?>(new int?[] { null, 2, 3 });
        public HashSet<int> arr2 { get; set; } = new HashSet<int>(new int[] { 1, 2, 3 });
        [JsonRequired]
        public HashSet<string> arr3 { get; set; } = new HashSet<string>(new string[] { "a", null, "c" });
        [JsonRequired]
        public HashSet<string> arr4 { get; set; } = new HashSet<string>(new string[] { "a", "b", "c" });
      `);
    });
  });
});
