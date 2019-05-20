package com.app.generated.graphql;

import com.apollographql.apollo.api.Mutation;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Input;
import com.app.generated.graphql.CreateTodoInput;
import javax.annotation.Nonnull;
import com.apollographql.apollo.api.internal.Utils;

@Generated("Apollo GraphQL")
public final class CreateTodoMutation implements Mutation<CreateTodoMutation.Data, CreateTodoMutation.Data, CreateTodoMutation.Variables> {
  public static final String OPERATION_DEFINITION = "mutation CreateTodo($input: CreateTodoInput!) {   createTodo(input: $input) {     id     name     description   } }";

  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;

  private static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "CreateTodo";
    }
  };

  private final CreateTodoMutation.Variables variables;

  public CreateTodoMutation(@Nonnull CreateTodoInput input) {
    Utils.checkNotNull(input, "input == null");      
    this.variables = new CreateTodoMutation.Variables(input);
  }

  @Override
  public String operationId() {
    return "ccf21c7837e09882049484de7ae1a14b";
  }

  @Override
  public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
  public CreateTodoMutation.Data wrapData(CreateTodoMutation.Data data) {
    return data;
  }
  
  @Override
  public CreateTodoMutation.Variables variables() {
    return variables;
  }
  
  @Override
  public ResponseFieldMapper<CreateTodoMutation.Data> responseFieldMapper() {
    return new Data.Mapper();
  }
  
  public static Builder builder() {
    return new Builder();
  }
  
  @Override
  public OperationName name() {
    return OPERATION_NAME;
  }
}
