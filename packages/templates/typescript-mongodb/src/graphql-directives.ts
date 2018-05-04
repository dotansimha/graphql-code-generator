import gql from 'graphql-tag';

export const directives = gql`
  # Table
  directive @entity(embedded: Boolean) on OBJECT

  # Field
  directive @column(overrideType: String, overrideIsArray: Boolean) on FIELD_DEFINITION

  directive @id on FIELD_DEFINITION

  directive @link on FIELD_DEFINITION

  directive @embedded on FIELD_DEFINITION
`;
