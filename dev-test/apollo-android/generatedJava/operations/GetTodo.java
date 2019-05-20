package com.app.generated.graphql;

import com.apollographql.apollo.api.Query;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Input;
import javax.annotation.Nonnull;
import com.apollographql.apollo.api.internal.Utils;

@Generated("Apollo GraphQL")
public final class GetTodoQuery implements Query<GetTodoQuery.Data, GetTodoQuery.Data, GetTodoQuery.Variables> {
  public static final String OPERATION_DEFINITION = "query GetTodo($id: ID!) {   getTodo(id: $id) {     id     name     description   } }";

  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;

  private static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "GetTodo";
    }
  };

  private final GetTodoQuery.Variables variables;

  public GetTodoQuery(@Nonnull String id) {
    Utils.checkNotNull(id, "id == null");      
    this.variables = new GetTodoQuery.Variables(id);
  }

  @Override
  public String operationId() {
    return "c44eec87be1feca567e036c2f6aa2905";
  }

  @Override
  public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
  public GetTodoQuery.Data wrapData(GetTodoQuery.Data data) {
    return data;
  }
  
  @Override
  public GetTodoQuery.Variables variables() {
    return variables;
  }
  
  @Override
  public ResponseFieldMapper<GetTodoQuery.Data> responseFieldMapper() {
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
