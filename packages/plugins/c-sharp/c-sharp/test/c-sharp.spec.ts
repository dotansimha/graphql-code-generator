import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';
import { CSharpResolversPluginRawConfig } from '../src/config.js';
import { getJsonAttributeSourceConfiguration } from '../src/json-attributes.js';
import each from 'jest-each';

describe('C#', () => {
  describe('Using directives', () => {
    it('Should include dotnet using directives', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum ns {
          dummy
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toContain('using System;');
      expect(result).toContain('using System.Collections.Generic;');
    });

    it('Should include default JSON using directives', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum ns {
          dummy
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toContain('using Newtonsoft.Json;');
    });

    each(['Newtonsoft.Json', 'System.Text.Json']).it(
      `Should include configured '%s' using directives`,
      async source => {
        const schema = buildSchema(/* GraphQL */ `
          enum ns {
            dummy
          }
        `);
        const config: CSharpResolversPluginRawConfig = {
          jsonAttributesSource: source,
        };
        const result = await plugin(schema, [], config, { outputFile: '' });
        const jsonConfig = getJsonAttributeSourceConfiguration(source);

        expect(result).toContain(`using ${jsonConfig.namespace};`);
      }
    );
  });

  describe('Namespaces', () => {
    it('Should wrap generated code block in namespace using default name', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum ns {
          dummy
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('namespace GraphQLCodeGen {');
    });

    it('Should wrap generated code block in namespace using custom name', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum ns {
          dummy
        }
      `);
      const result = await plugin(schema, [], { namespaceName: 'MyCompany.MyGeneratedGql' }, { outputFile: '' });
      expect(result).toContain('namespace MyCompany.MyGeneratedGql {');
    });
  });

  describe('Enums', () => {
    describe('Basic conversion', () => {
      it('Should convert enums to C# enums', async () => {
        const schema = buildSchema(/* GraphQL */ `
          enum UserRole {
            ADMIN
            USER
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`
          public enum UserRole {
            ADMIN,
            USER
          }
        `);
      });

      it('Should allow to override enum values with custom values', async () => {
        const schema = buildSchema(/* GraphQL */ `
          enum UserRole {
            ADMIN
            USER
          }
        `);
        const config: CSharpResolversPluginRawConfig = {
          enumValues: {
            UserRole: {
              ADMIN: 'AdminRoleValue',
            },
          },
        };
        const result = await plugin(schema, [], config, { outputFile: '' });

        expect(result).toContain('AdminRoleValue');
        expect(result).toContain('USER');
      });
    });

    describe('Comment and directives', () => {
      it('Should generate summary header for the enum type', async () => {
        const schema = buildSchema(/* GraphQL */ `
          """
          Allowed user roles
          """
          enum UserRole {
            admin
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`
          /// <summary>
          /// Allowed user roles
          /// </summary>
          public enum UserRole
        `);
      });

      it('Should generate summary header for enum values', async () => {
        const schema = buildSchema(/* GraphQL */ `
          enum UserRole {
            """
            Administrator role
            """
            admin
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`
          /// <summary>
          /// Administrator role
          /// </summary>
          admin
        `);
      });

      it('Should generate multiline summary header for enum values', async () => {
        const schema = buildSchema(/* GraphQL */ `
          enum UserRole {
            """
            Administrator role
            Note: normal users are not admins!
            """
            admin
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`
          /// <summary>
          /// Administrator role
          /// Note: normal users are not admins!
          /// </summary>
          admin
        `);
      });

      it('Should mark deprecated enum values with Obsolete attribute', async () => {
        const schema = buildSchema(/* GraphQL */ `
          enum UserRole {
            guest @deprecated(reason: "Guests not welcome")
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`[Obsolete("Guests not welcome")]
          guest
        `);
      });
    });

    describe('Reserved keywords', () => {
      it('Should prefix enum with @ when name is a reserved keyword', async () => {
        const schema = buildSchema(/* GraphQL */ `
          enum Visibility {
            public
            private
            protected
            internal
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo(`
          public enum Visibility {
            @public,
            @private,
            @protected,
            @internal
        `);
      });
    });
  });

  describe('Input Types', () => {
    it('Should generate C# class for input type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input UserInput {
          id: Int
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('public class UserInput {');
    });

    it('Should generate properties for input type fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input UserInput {
          id: Int
          email: String
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`
        public int? id { get; set; }
        public string email { get; set; }
      `);
    });

    it('Should generate C# method for creating input object', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input UserInput {
          id: Int
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('public dynamic GetInputObject()');
    });

    it('Should generate summary header for class and properties', async () => {
      const schema = buildSchema(/* GraphQL */ `
        """
        User Input values
        """
        input UserInput {
          """
          User id
          """
          id: Int!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

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
        [Required]
        [JsonRequired]
        public int id { get; set; }
      `);
    });
  });

  describe('Types', () => {
    it('Should generate C# class for type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: Int
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('public class User {');
    });
    it('Should generate C# record for type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: Int
        }
      `);
      const result = await plugin(schema, [], { emitRecords: true }, { outputFile: '' });
      expect(result).toContain('public record User(int? Id) {');
    });
    it('Should wrap generated classes in Type class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: Int
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('public class Types {');
    });

    it('Should wrap generated classes in custom Type class name', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: Int
        }
      `);
      const config: CSharpResolversPluginRawConfig = {
        className: 'MyGqlTypes',
      };
      const result = await plugin(schema, [], config, { outputFile: '' });
      expect(result).toContain('public class MyGqlTypes {');
    });

    it('Should prefix wrap name with @ when custom class name is a reserved keyword', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: Int
        }
      `);
      const config: CSharpResolversPluginRawConfig = {
        className: 'public',
      };
      const result = await plugin(schema, [], config, { outputFile: '' });
      expect(result).toContain('public class @public {');
    });

    each(['Newtonsoft.Json', 'System.Text.Json']).it(
      `Should generate properties for types using '%s' source`,
      async source => {
        const schema = buildSchema(/* GraphQL */ `
          type User {
            id: Int
            email: String
          }
        `);
        const config: CSharpResolversPluginRawConfig = {
          jsonAttributesSource: source,
        };
        const result = await plugin(schema, [], config, { outputFile: '' });
        const jsonConfig = getJsonAttributeSourceConfiguration(source);

        expect(result).toBeSimilarStringTo(`
          [${jsonConfig.propertyAttribute}("id")]
          public int? id { get; set; }
          [${jsonConfig.propertyAttribute}("email")]
          public string email { get; set; }
        `);
      }
    );

    it(`Should generate properties for types without JSON attributes`, async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: Int
          email: String
        }
      `);
      const config: CSharpResolversPluginRawConfig = {
        emitJsonAttributes: false,
      };
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
          public int? id { get; set; }
          public string email { get; set; }
        `);
    });

    it('Should generate summary header for class and properties', async () => {
      const schema = buildSchema(/* GraphQL */ `
        """
        User values
        """
        type User {
          """
          User id
          """
          id: Int!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

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
      const schema = buildSchema(/* GraphQL */ `
        type User {
          age: Int @deprecated
          refid: String @deprecated(reason: "Field is obsolete, use id")
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        [Obsolete("Field no longer supported")]
        [JsonProperty("age")]
        public int? age { get; set; }
      `);
      expect(result).toBeSimilarStringTo(`
        [Obsolete("Field is obsolete, use id")]
        [JsonProperty("refid")]
        public string refid { get; set; }
      `);
    });

    it('Should prefix class name with @ when type name is a reserved keyword', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type object {
          id: Int!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toContain('public class @object {');
    });
  });

  describe('Interfaces', () => {
    it('Should generate C# interface from gql interface', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Node {
          id: ID!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toContain('public interface Node {');
    });

    it('Should generate C# class that implements given interfaces', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface INode {
          id: ID!
        }
        interface INameNode {
          username: String!
        }

        type User implements INode & INameNode {
          id: ID!
          username: String!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toContain('public interface INode {');
      expect(result).toContain('public class User : INode, INameNode {');
    });
  });

  describe('GraphQL Value Types', () => {
    describe('Scalar', () => {
      each(['Newtonsoft.Json', 'System.Text.Json']).it(
        `Should generate properties for mandatory scalar types using '%s' source`,
        async source => {
          const schema = buildSchema(/* GraphQL */ `
            input BasicTypeInput {
              intReq: Int!
              fltReq: Float!
              idReq: ID!
              strReq: String!
              boolReq: Boolean!
            }
          `);

          const config: CSharpResolversPluginRawConfig = {
            jsonAttributesSource: source,
          };
          const result = await plugin(schema, [], config, { outputFile: '' });
          const jsonConfig = getJsonAttributeSourceConfiguration(source);
          const attributes =
            `
            [Required]
          ` +
            (jsonConfig.requiredAttribute == null
              ? ``
              : `
            [${jsonConfig.requiredAttribute}]
          `);

          expect(result).toBeSimilarStringTo(`
            ${attributes}
            public int intReq { get; set; }
            ${attributes}
            public double fltReq { get; set; }
            ${attributes}
            public string idReq { get; set; }
            ${attributes}
            public string strReq { get; set; }
            ${attributes}
            public bool boolReq { get; set; }
          `);
        }
      );

      it(`Should generate properties for mandatory scalar types with JSON attributes disabled`, async () => {
        const schema = buildSchema(/* GraphQL */ `
          input BasicTypeInput {
            intReq: Int!
            fltReq: Float!
            idReq: ID!
            strReq: String!
            boolReq: Boolean!
          }
        `);
        const config: CSharpResolversPluginRawConfig = {
          emitJsonAttributes: false,
        };
        const result = await plugin(schema, [], config, { outputFile: '' });

        expect(result).toBeSimilarStringTo(`
          [Required]
          public int intReq { get; set; }
          [Required]
          public double fltReq { get; set; }
          [Required]
          public string idReq { get; set; }
          [Required]
          public string strReq { get; set; }
          [Required]
          public bool boolReq { get; set; }
        `);
      });

      it('Should generate properties for optional scalar types', async () => {
        const schema = buildSchema(/* GraphQL */ `
          input BasicTypeInput {
            intOpt: Int
            fltOpt: Float
            idOpt: ID
            strOpt: String
            boolOpt: Boolean
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });

        expect(result).toBeSimilarStringTo(`
          public int? intOpt { get; set; }
          public double? fltOpt { get; set; }
          public string idOpt { get; set; }
          public string strOpt { get; set; }
          public bool? boolOpt { get; set; }
        `);
      });

      it('Should properly treat DateTime nullability', async () => {
        const schema = buildSchema(/* GraphQL */ `
          type Test {
            dateOptional: Date
            dateMandatory: Date!
          }

          scalar Date
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });

        expect(result).toBeSimilarStringTo(`
          [JsonProperty("dateOptional")]
          public DateTime? dateOptional { get; set; }
          [JsonProperty("dateMandatory")]
          public DateTime dateMandatory { get; set; }
        `);
      });
    });

    describe('Array', () => {
      it('Should use default list type for arrays', async () => {
        const schema = buildSchema(/* GraphQL */ `
          input ArrayInput {
            arr: [Int!]
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result).toBeSimilarStringTo('public List<int> arr { get; set; }');
      });

      it('Should use custom list type for arrays when listType is specified', async () => {
        const schema = buildSchema(/* GraphQL */ `
          input ArrayInput {
            arr: [Int!]
          }
        `);
        const result1 = await plugin(schema, [], { listType: 'IEnumerable' }, { outputFile: '' });
        expect(result1).toContain('public IEnumerable<int> arr { get; set; }');

        const result2 = await plugin(schema, [], { listType: 'HashSet' }, { outputFile: '' });
        expect(result2).toContain('public HashSet<int> arr { get; set; }');
      });

      it('Should use correct array inner types', async () => {
        const schema = buildSchema(/* GraphQL */ `
          input ArrayInput {
            arr1: [Int!]
            arr2: [Float]
            arr3: [Int]!
            arr4: [Boolean!]!
          }
        `);
        const config: CSharpResolversPluginRawConfig = {
          listType: 'IEnumerable',
        };
        const result = await plugin(schema, [], config, { outputFile: '' });

        expect(result).toBeSimilarStringTo(`
          public IEnumerable<int> arr1 { get; set; }
          public IEnumerable<double?> arr2 { get; set; }
          [Required]
          [JsonRequired]
          public IEnumerable<int?> arr3 { get; set; }
          [Required]
          [JsonRequired]
          public IEnumerable<bool> arr4 { get; set; }
        `);
      });

      it('Should handle nested array types', async () => {
        const schema = buildSchema(/* GraphQL */ `
          type Complex {
            arrA: [Boolean]
          }
          input ArrayInput {
            arr1: [[Int!]]
            arr2: [[[Float]!]!]!
            arr3: [[Complex]]!
          }
        `);
        const config: CSharpResolversPluginRawConfig = {
          listType: 'IEnumerable',
        };
        const result = await plugin(schema, [], config, { outputFile: '' });

        expect(result).toBeSimilarStringTo(`
          public IEnumerable<IEnumerable<int>> arr1 { get; set; }
          [Required]
          [JsonRequired]
          public IEnumerable<IEnumerable<IEnumerable<double?>>> arr2 { get; set; }
          [Required]
          [JsonRequired]
          public IEnumerable<IEnumerable<Complex>> arr3 { get; set; }
        `);
      });
    });

    describe('Reserved keywords', () => {
      it('Should prefix with @ when name is a reserved keyword', async () => {
        const schema = buildSchema(/* GraphQL */ `
          input ReservedInput {
            int: Int
            float: Float
            string: String
            bool: Boolean
          }
        `);
        const result = await plugin(schema, [], {}, { outputFile: '' });

        expect(result).toBeSimilarStringTo(`
          public int? @int { get; set; }
          public double? @float { get; set; }
          public string @string { get; set; }
          public bool? @bool { get; set; }
        `);
      });
    });
  });

  describe('Default Values', () => {
    it('Should mark required fields optional when a default value is assigned', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum Length {
          None
          Short
          Long
        }
        input InitialInput {
          val: Int! = 5
          flt: Float! = 3.1415
          str: ID! = "Dummy string"
          flag: Boolean! = true
          hair: Length! = Short
        }
      `);
      const config: CSharpResolversPluginRawConfig = {
        listType: 'HashSet',
      };
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        public int? val { get; set; }
        public double? flt { get; set; }
        public string str { get; set; }
        public bool? flag { get; set; }
        public Length? hair { get; set; }
      `);
    });

    it('Should mark required arrays optional when a default value is assigned', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input InitialInput {
          arr1: [Int] = [null, 2, 3]
          arr2: [Int!] = [1, 2, 3]
          arr3: [String]! = ["a", null, "c"]
          arr4: [String!]! = ["a", "b", "c"]
        }
      `);
      const config: CSharpResolversPluginRawConfig = {
        listType: 'HashSet',
      };
      const result = await plugin(schema, [], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        public HashSet<int?> arr1 { get; set; }
        public HashSet<int> arr2 { get; set; }
        public HashSet<string> arr3 { get; set; }
        public HashSet<string> arr4 { get; set; }
      `);
    });
  });
});
