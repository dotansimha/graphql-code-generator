package com.app.generated.graphql;

import com.apollographql.apollo.api.Mutation;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Input;
import com.app.generated.graphql.DeleteTodoInput;
import javax.annotation.Nonnull;
import com.apollographql.apollo.api.internal.Utils;

@Generated("Apollo GraphQL")
public final class DeleteTodoMutation implements Mutation<DeleteTodoMutation.Data, DeleteTodoMutation.Data, DeleteTodoMutation.Variables> {
  public static final String OPERATION_DEFINITION = "mutation DeleteTodo($input: DeleteTodoInput!) {   deleteTodo(input: $input) {     id     name     description   } }";

  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;

  private static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "DeleteTodo";
    }
  };

  private final DeleteTodoMutation.Variables variables;

  public DeleteTodoMutation(@Nonnull DeleteTodoInput input) {
    Utils.checkNotNull(input, "input == null");      
    this.variables = new DeleteTodoMutation.Variables(input);
  }

  @Override
  public String operationId() {
    return "f86f628796ee076cc8429f204e1c49cd";
  }

  @Override
  public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
  public DeleteTodoMutation.Data wrapData(DeleteTodoMutation.Data data) {
    return data;
  }
  
  @Override
  public DeleteTodoMutation.Variables variables() {
    return variables;
  }
  
  @Override
  public ResponseFieldMapper<DeleteTodoMutation.Data> responseFieldMapper() {
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
