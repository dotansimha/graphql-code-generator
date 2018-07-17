import gql from 'graphql-tag';

export const directives = gql`
  directive @union(discriminatorField: String) on UNION
  directive @abstractEntity(discriminatorField: String!) on INTERFACE
  directive @entity(embedded: Boolean, additionalFields: [AdditionalEntityFields]) on OBJECT
  directive @column(name: String, overrideType: String, overrideIsArray: Boolean) on FIELD_DEFINITION
  directive @id on FIELD_DEFINITION
  directive @link on FIELD_DEFINITION
  directive @embedded on FIELD_DEFINITION
  directive @map(path: String!) on FIELD_DEFINITION

  # Inputs
  input AdditionalEntityFields {
    path: String
    type: String
  }
`;
