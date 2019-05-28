package com.app.generated.graphql;

import com.apollographql.apollo.api.Query;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Operation;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.Input;
import javax.annotation.Nullable;
import java.lang.Integer;
import com.apollographql.apollo.api.ResponseField;
import javax.annotation.Nonnull;
import java.util.Collections;
import type.CustomType;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;
import java.util.List;
import com.apollographql.apollo.api.internal.UnmodifiableMapBuilder;
import java.lang.Object;
import java.util.LinkedHashMap;
import java.util.Map;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.InputFieldWriter;
import java.io.IOException;

@Generated("Apollo GraphQL")
public final class ListTodos2Query implements Query<ListTodos2Query.Data, ListTodos2Query.Data, ListTodos2Query.Variables> {
  public static final String OPERATION_DEFINITION = "query ListTodos2($q: String, $limit: Int, $nextToken: String) {   listTodos(filter: {name: {ne: $q}}, limit: $limit, nextToken: $nextToken) {     items {       id       name       description     }     nextToken   } }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "ListTodos2";
    }
  };
  private final ListTodos2Query.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public ListTodos2Query.Data wrapData(ListTodos2Query.Data data) {
    return data;
  }
  
  @Override
   public ListTodos2Query.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<ListTodos2Query.Data> responseFieldMapper() {
    return new Data.Mapper();
  }
  
  public static Builder builder() {
    return new Builder();
  }
  
  @Override
   public OperationName name() {
    return OPERATION_NAME;
  }
  
  public String operationId() {
    return "4af474ba1c47e1c5c1c6837063a90d55";
  }
  public static class Data implements Operation.Data {
    private final @Nullable ListTodos listTodos;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("listTodos", "listTodos", new UnmodifiableMapBuilder<String, Object>(3).put("filter", new UnmodifiableMapBuilder<String, Object>(1).put("name", new UnmodifiableMapBuilder<String, Object>(1).put("ne", new UnmodifiableMapBuilder<String, Object>(2).put("kind", "Variable").put("variableName", "q").build()).build()).build()).put("limit", new UnmodifiableMapBuilder<String, Object>(2).put("kind", "Variable").put("variableName", "limit").build()).put("nextToken", new UnmodifiableMapBuilder<String, Object>(2).put("kind", "Variable").put("variableName", "nextToken").build()).build(), true, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nullable ListTodos listTodos) {
      this.listTodos = listTodos;
    }
    
    public @Nullable ListTodos listTodos() {
      return this.listTodos;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "listTodos=" + listTodos + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof Data) {
        Data that = (Data) o;
        return ((this.listTodos == null) ? (that.listTodos == null) : this.listTodos.equals(that.listTodos));
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= (listTodos == null) ? 0 : listTodos.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeObject($responseFields[0], listTodos != null ? listTodos.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Data> {
      private final ListTodos.Mapper listTodosFieldMapper = new ListTodos.Mapper();
      @Override
       public Data map(ResponseReader reader) {
        final ListTodos listTodos = reader.readObject($responseFields[0], new ResponseReader.ObjectReader<ListTodos>() {
                  @Override
                  public ListTodos read(ResponseReader reader) {
                    return listTodosFieldMapper.map(reader);
                  }
                });
        return new Data(listTodos);
      }
    }
    
  }
  

  public static class ListTodos {
    private final @Nonnull String __typename;
    private final @Nullable List<Item> items;
    private final @Nullable String nextToken;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forObject("items", "items", null, true, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("nextToken", "nextToken", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public ListTodos(@Nonnull String __typename, @Nullable List<Item> items, @Nullable String nextToken) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.items = items;
      this.nextToken = nextToken;
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nullable List<Item> items() {
      return this.items;
    }
    
    public @Nullable String nextToken() {
      return this.nextToken;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "ListTodos{"
          + "__typename=" + __typename + ", "
          + "items=" + items + ", "
          + "nextToken=" + nextToken + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof ListTodos) {
        ListTodos that = (ListTodos) o;
        return this.__typename.equals(that.__typename) && ((this.items == null) ? (that.items == null) : this.items.equals(that.items)) && ((this.nextToken == null) ? (that.nextToken == null) : this.nextToken.equals(that.nextToken));
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= __typename.hashCode();
        h *= 1000003;
        h ^= (items == null) ? 0 : items.hashCode();
        h *= 1000003;
        h ^= (nextToken == null) ? 0 : nextToken.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeString($responseFields[0], __typename);
          writer.writeList($responseFields[1], items, new ResponseWriter.ListWriter() {
            @Override
            public void write(Object value, ResponseWriter.ListItemWriter listItemWriter) {
              listItemWriter.writeObject(((Item) value).marshaller());
            }
          });
          writer.writeString($responseFields[2], nextToken != null ? nextToken : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<ListTodos> {
      private final Item.Mapper itemsFieldMapper = new Item.Mapper();
      @Override
       public ListTodos map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final List<Item> items = reader.readList($responseFields[1], new ResponseReader.ListReader<Item>() {
          @Override
          public Item read(ResponseReader.ListItemReader listItemReader) {
            return listItemReader.readObject();
          }
        });
        final String nextToken = reader.readString($responseFields[2]);
        return new ListTodos(__typename, items, nextToken);
      }
    }
    
  }
  

  public static class Item {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nonnull String name;
    private final @Nullable String description;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("id", "id", null, false, CustomType.ID, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("name", "name", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("description", "description", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public Item(@Nonnull String __typename, @Nonnull String id, @Nonnull String name, @Nullable String description) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.name = Utils.checkNotNull(name, "name == null");
      this.description = description;
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nonnull String id() {
      return this.id;
    }
    
    public @Nonnull String name() {
      return this.name;
    }
    
    public @Nullable String description() {
      return this.description;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Item{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "name=" + name + ", "
          + "description=" + description + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof Item) {
        Item that = (Item) o;
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && this.name.equals(that.name) && ((this.description == null) ? (that.description == null) : this.description.equals(that.description));
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= __typename.hashCode();
        h *= 1000003;
        h ^= id.hashCode();
        h *= 1000003;
        h ^= name.hashCode();
        h *= 1000003;
        h ^= (description == null) ? 0 : description.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeString($responseFields[0], __typename);
          writer.writeCustom((ResponseField.CustomTypeField) $responseFields[1], id);
          writer.writeString($responseFields[2], name);
          writer.writeString($responseFields[3], description != null ? description : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Item> {
      @Override
       public Item map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String id = reader.readCustomType((ResponseField.CustomTypeField) $responseFields[1]);
        final String name = reader.readString($responseFields[2]);
        final String description = reader.readString($responseFields[3]);
        return new Item(__typename, id, name, description);
      }
    }
    
  }
  

  public static final class Builder {
    private @Nullable String q;
    private @Nullable Integer limit;
    private @Nullable String nextToken;
    Builder() {
      
    }
    
    public Builder q(@Nullable String q) {
      this.q = q;
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
    
    public ListTodos2Query build() {
      return new ListTodos2Query(q, limit, nextToken);
    }
  }
  

  public static final class Variables extends Operation.Variables {
    private @Nonnull String q;
    private @Nonnull Integer limit;
    private @Nonnull String nextToken;
    private final transient Map<String, Object> valueMap = new LinkedHashMap<>();
    public String q() {
      return q;
    }
    
    public Integer limit() {
      return limit;
    }
    
    public String nextToken() {
      return nextToken;
    }
    
    public Variables(@Nonnull String q, @Nonnull Integer limit, @Nonnull String nextToken) {
      this.q = q;
      this.valueMap.put("q", q);
      this.limit = limit;
      this.valueMap.put("limit", limit);
      this.nextToken = nextToken;
      this.valueMap.put("nextToken", nextToken);
    }
    
    @Override
     public Map<String, Object> valueMap() {
      return Collections.unmodifiableMap(valueMap);
    }
    
    @Override
     public InputFieldMarshaller marshaller() {
      return new InputFieldMarshaller() {
        @Override
        public void marshal(InputFieldWriter writer) throws IOException {
          writer.writeString("q", q);
          writer.writeInt("limit", limit);
          writer.writeString("nextToken", nextToken);
        }
      };
    }
  }
  
  public ListTodos2Query(@Nullable String q, @Nullable Integer limit, @Nullable String nextToken) {
        
    this.variables = new ListTodos2Query.Variables(q, limit, nextToken);
  }
}
