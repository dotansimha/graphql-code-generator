package com.app.generated.graphql;

import com.apollographql.apollo.api.Query;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Input;
import com.app.generated.graphql.ModelTodoFilterInput;
import javax.annotation.Nullable;
import java.lang.Integer;

@Generated("Apollo GraphQL")
public final class ListTodosQuery implements Query<ListTodosQuery.Data, ListTodosQuery.Data, ListTodosQuery.Variables> {
  public static final String OPERATION_DEFINITION = "query ListTodos($filter: ModelTodoFilterInput, $limit: Int, $nextToken: String) {   listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {     items {       id       name       description     }     nextToken   } }";

  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;

  private static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "ListTodos";
    }
  };

  private final ListTodosQuery.Variables variables;

  public ListTodosQuery(@Nullable ModelTodoFilterInput filter, @Nullable Integer limit, @Nullable String nextToken) {
        
    this.variables = new ListTodosQuery.Variables(filter, limit, nextToken);
  }

  @Override
  public String operationId() {
    return "e7d954ccc0ea1bdc65aed226eeb8a504";
  }

  @Override
  public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
  public ListTodosQuery.Data wrapData(ListTodosQuery.Data data) {
    return data;
  }
  
  @Override
  public ListTodosQuery.Variables variables() {
    return variables;
  }
  
  @Override
  public ResponseFieldMapper<ListTodosQuery.Data> responseFieldMapper() {
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
