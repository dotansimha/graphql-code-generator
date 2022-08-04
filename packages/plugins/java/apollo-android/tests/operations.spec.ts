import '@graphql-codegen/testing';
import { parse, buildSchema } from 'graphql';
import { plugin } from '../src/plugin.js';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { FileType } from '../src/file-type.js';

describe('Operations Visitor', () => {
  const schema = buildSchema(/* GraphQL */ `
    """
    This directive allows results to be deferred during execution
    """
    directive @defer on FIELD

    """
    Tells the service this field/object has access authorized by an API key.
    """
    directive @aws_api_key on OBJECT | FIELD_DEFINITION

    """
    Tells the service this field/object has access authorized by a Cognito User Pools token.
    """
    directive @aws_cognito_user_pools(
      """
      List of cognito user pool groups which have access on this field
      """
      cognito_groups: [String]
    ) on OBJECT | FIELD_DEFINITION

    """
    Directs the schema to enforce authorization on a field
    """
    directive @aws_auth(
      """
      List of cognito user pool groups which have access on this field
      """
      cognito_groups: [String]
    ) on FIELD_DEFINITION

    """
    Tells the service which subscriptions will be published to when this mutation is
    called. This directive is deprecated use @aws_susbscribe directive instead.
    """
    directive @aws_publish(
      """
      List of subscriptions which will be published to when this mutation is called.
      """
      subscriptions: [String]
    ) on FIELD_DEFINITION

    """
    Tells the service this field/object has access authorized by an OIDC token.
    """
    directive @aws_oidc on OBJECT | FIELD_DEFINITION

    """
    Tells the service this field/object has access authorized by sigv4 signing.
    """
    directive @aws_iam on OBJECT | FIELD_DEFINITION

    """
    Tells the service which mutation triggers this subscription.
    """
    directive @aws_subscribe(
      """
      List of mutations which will trigger this subscription when they are called.
      """
      mutations: [String]
    ) on FIELD_DEFINITION

    input CreateProductInput {
      id: ID
      title: String!
      content: String!
      price: Int
      rating: Float
    }

    input DeleteProductInput {
      id: ID
    }

    input ModelBooleanFilterInput {
      ne: Boolean
      eq: Boolean
    }

    input ModelFloatFilterInput {
      ne: Float
      eq: Float
      le: Float
      lt: Float
      ge: Float
      gt: Float
      contains: Float
      notContains: Float
      between: [Float]
    }

    input ModelIDFilterInput {
      ne: ID
      eq: ID
      le: ID
      lt: ID
      ge: ID
      gt: ID
      contains: ID
      notContains: ID
      between: [ID]
      beginsWith: ID
    }

    input ModelIntFilterInput {
      ne: Int
      eq: Int
      le: Int
      lt: Int
      ge: Int
      gt: Int
      contains: Int
      notContains: Int
      between: [Int]
    }

    type ModelProductConnection {
      items: [Product]
      nextToken: String
    }

    input ModelProductFilterInput {
      id: ModelIDFilterInput
      title: ModelStringFilterInput
      content: ModelStringFilterInput
      price: ModelIntFilterInput
      rating: ModelFloatFilterInput
      and: [ModelProductFilterInput]
      or: [ModelProductFilterInput]
      not: ModelProductFilterInput
    }

    enum ModelSortDirection {
      ASC
      DESC
    }

    input ModelStringFilterInput {
      ne: String
      eq: String
      le: String
      lt: String
      ge: String
      gt: String
      contains: String
      notContains: String
      between: [String]
      beginsWith: String
    }

    type Mutation {
      createProduct(input: CreateProductInput!): Product
      updateProduct(input: UpdateProductInput!): Product
      deleteProduct(input: DeleteProductInput!): Product
    }

    type Product {
      id: ID!
      title: String!
      content: String!
      price: Int
      rating: Float
    }

    type Query {
      getProduct(id: ID!): Product
      listProducts(filter: ModelProductFilterInput, limit: Int, nextToken: String): ModelProductConnection
    }

    type Subscription {
      onCreateProduct: Product
      onUpdateProduct: Product
      onDeleteProduct: Product
    }

    input UpdateProductInput {
      id: ID!
      title: String
      content: String
      price: Int
      rating: Float
    }
  `);

  it('Should handle Query correctly', async () => {
    const ast = {
      document: parse(/* GraphQL */ `
        query ListProducts($filter: ModelProductFilterInput, $limit: Int, $nextToken: String) {
          listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
            items {
              id
              title
              content
              price
              rating
            }
            nextToken
          }
        }
      `),
      location: '',
    };

    const result = await plugin(schema, [ast], { package: 'app.test.generated.graphql', fileType: FileType.OPERATION });
    const output = mergeOutputs([result]);

    expect(output).toMatchSnapshot();

    expect(output).toBeSimilarStringTo(`
    public ListProductsQuery(@Nullable ModelProductFilterInput filter, @Nullable Integer limit, @Nullable String nextToken) {
      this.variables = new ListProductsQuery.Variables(filter, limit, nextToken);
    }
    `);

    expect(output).toContain(`public String operationId() {`);
    expect(output).toContain(`public String queryDocument() {`);
    expect(output).toBeSimilarStringTo(`
    @Override
    public ListProductsQuery.Data wrapData(ListProductsQuery.Data data) {
      return data;
    }
    `);
    expect(output).toBeSimilarStringTo(`
    @Override
    public ResponseFieldMapper<ListProductsQuery.Data> responseFieldMapper() {
      return new Data.Mapper();
    }`);
    expect(output).toBeSimilarStringTo(`static final ResponseField[] $responseFields = {
      ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
      ResponseField.forList("items", "items", null, true, Collections.<ResponseField.Condition>emptyList()),
      ResponseField.forString("nextToken", "nextToken", null, true, Collections.<ResponseField.Condition>emptyList())
    };`);
    expect(output).toBeSimilarStringTo(`
    public static final class Builder {
      private @Nullable ModelProductFilterInput filter;
  
      private @Nullable Integer limit;
  
      private @Nullable String nextToken;
  
      Builder() {
      }
  
      public Builder filter(@Nullable ModelProductFilterInput filter) {
        this.filter = filter;
        return this;
      }
  
      public Builder limit(@Nullable Integer limit) {
        this.limit = limit;
        return this;
      }
  
      public Builder nextToken(@Nullable String nextToken) {
        this.nextToken = nextToken;
        return this;
      }
  
      public ListProductsQuery build() {
        return new ListProductsQuery(filter, limit, nextToken);
      }
    }`);
  });

  it('Should handle Query correctly with fragments', async () => {
    const ast = {
      document: parse(/* GraphQL */ `
        query ListProducts($filter: ModelProductFilterInput, $limit: Int, $nextToken: String) {
          listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
            items {
              ...ProductFields
              ...ProductFields2
            }
            nextToken
          }
        }

        fragment ProductFields on Product {
          id
          title
          content
          price
          rating
        }

        fragment ProductFields2 on Product {
          title
          content
        }
      `),
      location: '',
    };

    const result = await plugin(schema, [ast], { package: 'app.test.generated.graphql', fileType: FileType.OPERATION });
    const output = mergeOutputs([result]);
    expect(output).toMatchSnapshot();
    expect(output).toContain(
      `final Fragments fragments = reader.readConditional($responseFields[1], new ResponseReader.ConditionalTypeReader<Fragments>() {`
    );
  });
});
