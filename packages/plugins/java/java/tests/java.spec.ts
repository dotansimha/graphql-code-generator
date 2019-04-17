import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';
import { validateJava } from '../../common/tests/validate-java';

const OUTPUT_FILE = 'com/java/generated/resolvers.java';

describe('Java', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      me: User!
      user(id: ID!): User!
      searchUser(searchFields: SearchUser!): [User!]!
    }

    input InputWithArray {
      f: [String]
      g: [SearchUser]
    }

    input SearchUser {
      username: String
      email: String
      name: String
      sort: ResultSort
      metadata: MetadataSearch
    }

    input MetadataSearch {
      something: Int
    }

    enum ResultSort {
      ASC
      DESC
    }

    interface Node {
      id: ID!
    }

    type User implements Node {
      id: ID!
      username: String!
      email: String!
      name: String
      friends(skip: Int, limit: Int): [User!]!
    }

    type Chat implements Node {
      id: ID!
      users: [User!]!
      title: String
    }

    enum UserRole {
      ADMIN
      USER
      EDITOR
    }

    union SearchResult = Chat | User
  `);

  it('Should produce valid Java code', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    validateJava(result);
  });

  describe('Config', () => {
    it('Should use the correct package name by default', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toContain(`package com.java.generated;`);
    });

    it('Should use the package name provided from the config', async () => {
      const result = await plugin(schema, [], { package: 'com.my.package' }, { outputFile: OUTPUT_FILE });

      expect(result).toContain(`package com.my.package;`);
    });
  });

  describe('Enums', () => {
    it('Should add imports that are relevant to enums', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toContain(`import java.util.HashMap;`);
      expect(result).toContain(`import java.util.Map;`);
    });

    it('Should generate basic enums correctly', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`    public enum UserRole {
        Admin("ADMIN"),
        User("USER"),
        Editor("EDITOR");
        
        public final String label;
         
        UserRole(String label) {
          this.label = label;
        }
        
        private static final Map<String, UserRole> BY_LABEL = new HashMap<>();
          
        static {
            for (UserRole e : values()) {
                BY_LABEL.put(e.label, e);
            }
        }
        
        public static UserRole valueOfLabel(String label) {
          return BY_LABEL.get(label);
        }
      }`);
    });

    it('Should allow to override enum values with custom values', async () => {
      const result = await plugin(
        schema,
        [],
        {
          enumValues: {
            UserRole: {
              ADMIN: 'AdminRoleValue',
            },
          },
        },
        { outputFile: OUTPUT_FILE }
      );

      expect(result).toContain(`Admin("AdminRoleValue"),`);
      expect(result).toContain(`User("USER"),`);
    });
  });

  describe('Input Types / Arguments', () => {
    it('Should generate arguments correctly when using Array', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class InputWithArrayInput {
        private Iterable<String> _f;
        private Iterable<SearchUserInput> _g;
      
        public InputWithArrayInput(Map<String, Object> args) {
          if (args != null) {
            this._f = (Iterable<String>) args.get("f");
            this._g = ((List<Map<String, Object>>) args.get("g")).stream().map(SearchUserInput::new).collect(Collectors.toList());
          }
        }
      
        public Iterable<String> getF() { return this._f; }
        public Iterable<SearchUserInput> getG() { return this._g; }
      }`);
    });

    it('Should generate input class per each type with field arguments', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class UserFriendsArgs {
        private Integer _skip;
        private Integer _limit;
      
        public UserFriendsArgs(Map<String, Object> args) {
          if (args != null) {
            this._skip = (Integer) args.get("skip");
            this._limit = (Integer) args.get("limit");
          }
        }
      
        public Integer getSkip() { return this._skip; }
        public Integer getLimit() { return this._limit; }
      }`);
    });

    it('Should generate input class per each query with arguments', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class QueryUserArgs {
        private Object _id;
      
        public QueryUserArgs(Map<String, Object> args) {
          if (args != null) {
            this._id = (Object) args.get("id");
          }
        }
      
        public Object getId() { return this._id; }
      }`);

      expect(result).toBeSimilarStringTo(`public static class QuerySearchUserArgs {
        private SearchUserInput _searchFields;
      
        public QuerySearchUserArgs(Map<String, Object> args) {
          if (args != null) {
            this._searchFields = new SearchUserInput((Map<String, Object>) args.get("searchFields"));
          }
        }
      
        public SearchUserInput getSearchFields() { return this._searchFields; }
      }`);
    });

    it('Should generate input class per each input, also with nested input types', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class MetadataSearchInput {
        private Integer _something;
      
        public MetadataSearchInput(Map<String, Object> args) {
          if (args != null) {
            this._something = (Integer) args.get("something");
          }
        }
      
        public Integer getSomething() { return this._something; }
      }`);

      expect(result).toBeSimilarStringTo(`public static class SearchUserInput {
        private String _username;
        private String _email;
        private String _name;
        private ResultSort _sort;
        private MetadataSearchInput _metadata;
      
        public SearchUserInput(Map<String, Object> args) {
          if (args != null) {
            this._username = (String) args.get("username");
            this._email = (String) args.get("email");
            this._name = (String) args.get("name");
            this._sort = (ResultSort) args.get("sort");
            this._metadata = new MetadataSearchInput((Map<String, Object>) args.get("metadata"));
          }
        }
      
        public String getUsername() { return this._username; }
        public String getEmail() { return this._email; }
        public String getName() { return this._name; }
        public ResultSort getSort() { return this._sort; }
        public MetadataSearchInput getMetadata() { return this._metadata; }
      }`);
    });
  });
});
