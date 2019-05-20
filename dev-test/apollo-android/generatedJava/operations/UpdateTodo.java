package com.app.generated.graphql;

import com.apollographql.apollo.api.Mutation;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Input;
import com.app.generated.graphql.UpdateTodoInput;
import javax.annotation.Nonnull;
import com.apollographql.apollo.api.internal.Utils;

@Generated("Apollo GraphQL")
public final class UpdateTodoMutation implements Mutation<UpdateTodoMutation.Data, UpdateTodoMutation.Data, UpdateTodoMutation.Variables> {
  public static final String OPERATION_DEFINITION = "mutation UpdateTodo($input: UpdateTodoInput!) {   updateTodo(input: $input) {     id     name     description   } }";

  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;

  private static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "UpdateTodo";
    }
  };

  private final UpdateTodoMutation.Variables variables;

  public UpdateTodoMutation(@Nonnull UpdateTodoInput input) {
    Utils.checkNotNull(input, "input == null");      
    this.variables = new UpdateTodoMutation.Variables(input);
  }

  @Override
  public String operationId() {
    return "c4949ad7b9f5829a0421d47acbf17e88";
  }

  @Override
  public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
  public UpdateTodoMutation.Data wrapData(UpdateTodoMutation.Data data) {
    return data;
  }
  
  @Override
  public UpdateTodoMutation.Variables variables() {
    return variables;
  }
  
  @Override
  public ResponseFieldMapper<UpdateTodoMutation.Data> responseFieldMapper() {
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
