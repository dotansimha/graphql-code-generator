import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';
import { validateJava } from '../../common/tests/validate-java.js';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';

const OUTPUT_FILE = 'com/java/generated/resolvers.java';

describe('Java', () => {
  const schema = buildSchema(/* GraphQL */ `
    scalar DateTime

    type Query {
      me: User!
      user(id: ID!): User!
      searchUser(searchFields: SearchUser!): [User!]!
      updateUser(input: UpdateUserMetadataInput!): [User!]!
      authorize(roles: [UserRole]): Boolean
    }

    input InputWithArray {
      f: [String]
      g: [SearchUser]
    }

    input SearchUser {
      username: String
      email: String
      name: String
      dateOfBirth: DateTime
      sort: ResultSort
      metadata: MetadataSearch
    }

    input MetadataSearch {
      something: Int
    }

    input UpdateUserInput {
      id: ID!
      username: String
      metadata: UpdateUserMetadataInput
    }

    input UpdateUserMetadataInput {
      something: Int
    }

    input CustomInput {
      id: ID!
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
      dateOfBirth: DateTime
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

    validateJava(mergeOutputs([result]));
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
        ADMIN,
        USER,
        EDITOR      
                
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

      expect(result).toContain(`AdminRoleValue,`);
      expect(result).toContain(`USER,`);
    });
  });

  describe('Input Types / Arguments useEmptyCtor default false', () => {
    it('Should generate arguments correctly when using Array', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class InputWithArrayInput {
        private Iterable<String> f;
        private Iterable<SearchUserInput> g;
      
        public InputWithArrayInput(Map<String, Object> args) {
          if (args != null) {
            this.f = (Iterable<String>) args.get("f");
            if (args.get("g") != null) {
              this.g = (Iterable<SearchUserInput>) args.get("g");
            }
          }
        }
      
        public Iterable<String> getF() { return this.f; }
        public Iterable<SearchUserInput> getG() { return this.g; }
        public void setF(Iterable<String> f) { this.f = f; }
        public void setG(Iterable<SearchUserInput> g) { this.g = g; }
      }`);
    });

    it('Should generate input class per each type with field arguments', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class UserFriendsArgs {
        private Integer skip;
        private Integer limit;
      
        public UserFriendsArgs(Map<String, Object> args) {
          if (args != null) {
            this.skip = (Integer) args.get("skip");
            this.limit = (Integer) args.get("limit");
          }
        }
      
        public Integer getSkip() { return this.skip; }
        public Integer getLimit() { return this.limit; }
        public void setSkip(Integer skip) { this.skip = skip; }
        public void setLimit(Integer limit) { this.limit = limit; }
      }`);
    });

    it('Should omit extra Input suffix from input class name if schema name already includes the "Input" suffix', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class CustomInput {
        private Object id;
      
        public CustomInput(Map<String, Object> args) {
          if (args != null) {
            this.id = (Object) args.get("id");
          }
        }
      
        public Object getId() { return this.id; }
        public void setId(Object id) { this.id = id; }
      }`);
    });

    it('Should generate input class per each query with arguments', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class QueryUserArgs {
        private Object id;
      
        public QueryUserArgs(Map<String, Object> args) {
          if (args != null) {
            this.id = (Object) args.get("id");
          }
        }
      
        public Object getId() { return this.id; }
        public void setId(Object id) { this.id = id; }
      }`);

      expect(result).toBeSimilarStringTo(`public static class QuerySearchUserArgs {
        private SearchUserInput searchFields;
      
        public QuerySearchUserArgs(Map<String, Object> args) {
          if (args != null) {
            this.searchFields = new SearchUserInput((Map<String, Object>) args.get("searchFields"));
          }
        }
      
        public SearchUserInput getSearchFields() { return this.searchFields; }
        public void setSearchFields(SearchUserInput searchFields) { this.searchFields = searchFields; }
      }`);
    });

    it('Should generate check type for enum', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });
      expect(result).toBeSimilarStringTo(`if (args.get("sort") instanceof ResultSort) {
        this.sort = (ResultSort) args.get("sort");
      } else {
        this.sort = ResultSort.valueOf((String) args.get("sort"));
      }`);
    });

    it('Should generate check type for enum when arg with enum list', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });
      expect(result).toBeSimilarStringTo(`if (args.get("roles") != null) {
        this.roles = ((List<Object>) args.get("roles")).stream()
                .map(item -> item instanceof UserRole ? item : UserRole.valueOf((String) item))
                .map(UserRole.class::cast)
                .collect(Collectors.toList());
       }`);
    });

    it('Should generate input class per each input, also with nested input types', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class MetadataSearchInput {
        private Integer something;
      
        public MetadataSearchInput(Map<String, Object> args) {
          if (args != null) {
            this.something = (Integer) args.get("something");
          }
        }
      
        public Integer getSomething() { return this.something; }
        public void setSomething(Integer something) { this.something = something; }
      }`);

      expect(result).toBeSimilarStringTo(`public static class SearchUserInput {
        private String username;
        private String email;
        private String name;
        private Object dateOfBirth;
        private ResultSort sort;
        private MetadataSearchInput metadata;
      
        public SearchUserInput(Map<String, Object> args) {
          if (args != null) {
            this.username = (String) args.get("username");
            this.email = (String) args.get("email");
            this.name = (String) args.get("name");
            this.dateOfBirth = (Object) args.get("dateOfBirth");
            if (args.get("sort") instanceof ResultSort) {
              this.sort = (ResultSort) args.get("sort");
            } else {
              this.sort = ResultSort.valueOf((String) args.get("sort"));
            }
            this.metadata = new MetadataSearchInput((Map<String, Object>) args.get("metadata"));
          }
        }
      
        public String getUsername() { return this.username; }
        public String getEmail() { return this.email; }
        public String getName() { return this.name; }
        public Object getDateOfBirth() { return this.dateOfBirth; }
        public ResultSort getSort() { return this.sort; }
        public MetadataSearchInput getMetadata() { return this.metadata; }
        public void setUsername(String username) { this.username = username; }
        public void setEmail(String email) { this.email = email; }
        public void setName(String name) { this.name = name; }
        public void setDateOfBirth(Object dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public void setSort(ResultSort sort) { this.sort = sort; }
        public void setMetadata(MetadataSearchInput metadata) { this.metadata = metadata; }
      }`);
    });

    it('Should generate nested inputs with out duplicated `Input` suffix', async () => {
      const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class UpdateUserMetadataInput {
        private Integer something;
      
        public UpdateUserMetadataInput(Map<String, Object> args) {
          if (args != null) {
            this.something = (Integer) args.get("something");
          }
        }
      
        public Integer getSomething() { return this.something; }
        public void setSomething(Integer something) { this.something = something; }
      }`);

      expect(result).toBeSimilarStringTo(`public static class UpdateUserInput {
        private Object id;
        private String username;
        private UpdateUserMetadataInput metadata;
      
        public UpdateUserInput(Map<String, Object> args) {
          if (args != null) {
            this.id = (Object) args.get("id");
            this.username = (String) args.get("username");
            this.metadata = new UpdateUserMetadataInput((Map<String, Object>) args.get("metadata"));
          }
        }
      
        public Object getId() { return this.id; }
        public String getUsername() { return this.username; }
        public UpdateUserMetadataInput getMetadata() { return this.metadata; }
        public void setId(Object id) { this.id = id; }
        public void setUsername(String username) { this.username = username; }
        public void setMetadata(UpdateUserMetadataInput metadata) { this.metadata = metadata; }
      }`);
    });
  });

  describe('Input Types / Arguments useEmptyCtor true', () => {
    it('Should generate arguments correctly when using Array', async () => {
      const result = await plugin(schema, [], { useEmptyCtor: true }, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class InputWithArrayInput {
        private Iterable<String> f;
        private Iterable<SearchUserInput> g;
      
        public InputWithArrayInput() {}          
      
        public Iterable<String> getF() { return this.f; }
        public Iterable<SearchUserInput> getG() { return this.g; }
        public void setF(Iterable<String> f) { this.f = f; }
        public void setG(Iterable<SearchUserInput> g) { this.g = g; }
      }`);
    });

    it('Should generate input class per each type with field arguments', async () => {
      const result = await plugin(schema, [], { useEmptyCtor: true }, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class UserFriendsArgs {
        private Integer skip;
        private Integer limit;
      
        public UserFriendsArgs() {}         
      
        public Integer getSkip() { return this.skip; }
        public Integer getLimit() { return this.limit; }
        public void setSkip(Integer skip) { this.skip = skip; }
        public void setLimit(Integer limit) { this.limit = limit; }
      }`);
    });

    it('Should omit extra Input suffix from input class name if schema name already includes the "Input" suffix', async () => {
      const result = await plugin(schema, [], { useEmptyCtor: true }, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class CustomInput {
        private Object id;
      
        public CustomInput() {}          
      
        public Object getId() { return this.id; }
        public void setId(Object id) { this.id = id; }
      }`);
    });

    it('Should generate input class per each query with arguments', async () => {
      const result = await plugin(schema, [], { useEmptyCtor: true }, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class QueryUserArgs {
        private Object id;
      
        public QueryUserArgs() {}
              
        public Object getId() { return this.id; }
        public void setId(Object id) { this.id = id; }
      }`);

      expect(result).toBeSimilarStringTo(`public static class QuerySearchUserArgs {
        private SearchUserInput searchFields;
      
        public QuerySearchUserArgs() {}
      
        public SearchUserInput getSearchFields() { return this.searchFields; }
        public void setSearchFields(SearchUserInput searchFields) { this.searchFields = searchFields; }
      }`);
    });

    // it('Should generate check type for enum', async () => {
    //   const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });
    //   expect(result).toBeSimilarStringTo(`if (args.get("sort") instanceof ResultSort) {
    //     this.sort = (ResultSort) args.get("sort");
    //   } else {
    //     this.sort = ResultSort.valueOf((String) args.get("sort"));
    //   }`);
    // });

    it('Should generate input class per each input, also with nested input types', async () => {
      const result = await plugin(schema, [], { useEmptyCtor: true }, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class MetadataSearchInput {
        private Integer something;
      
        public MetadataSearchInput() {}
      
        public Integer getSomething() { return this.something; }
        public void setSomething(Integer something) { this.something = something; }
      }`);

      expect(result).toBeSimilarStringTo(`public static class SearchUserInput {
        private String username;
        private String email;
        private String name;
        private Object dateOfBirth;
        private ResultSort sort;
        private MetadataSearchInput metadata;
      
        public SearchUserInput() {}
      
        public String getUsername() { return this.username; }
        public String getEmail() { return this.email; }
        public String getName() { return this.name; }
        public Object getDateOfBirth() { return this.dateOfBirth; }
        public ResultSort getSort() { return this.sort; }
        public MetadataSearchInput getMetadata() { return this.metadata; }
        public void setUsername(String username) { this.username = username; }
        public void setEmail(String email) { this.email = email; }
        public void setName(String name) { this.name = name; }
        public void setDateOfBirth(Object dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public void setSort(ResultSort sort) { this.sort = sort; }
        public void setMetadata(MetadataSearchInput metadata) { this.metadata = metadata; }
        
      }`);
    });

    it('Should generate nested inputs with out duplicated `Input` suffix', async () => {
      const result = await plugin(schema, [], { useEmptyCtor: true }, { outputFile: OUTPUT_FILE });

      expect(result).toBeSimilarStringTo(`public static class UpdateUserMetadataInput {
        private Integer something;
      
        public UpdateUserMetadataInput() {}
      
        public Integer getSomething() { return this.something; }
        public void setSomething(Integer something) { this.something = something; }
      }`);

      expect(result).toBeSimilarStringTo(`public static class UpdateUserInput {
        private Object id;
        private String username;
        private UpdateUserMetadataInput metadata;
      
        public UpdateUserInput() {}
          
        public Object getId() { return this.id; }
        public String getUsername() { return this.username; }
        public UpdateUserMetadataInput getMetadata() { return this.metadata; }
        public void setId(Object id) { this.id = id; }
        public void setUsername(String username) { this.username = username; }
        public void setMetadata(UpdateUserMetadataInput metadata) { this.metadata = metadata; }
      }`);
    });
  });
});
