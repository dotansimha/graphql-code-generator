package com.app.generated.graphql;

import com.apollographql.apollo.api.Query;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Operation;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.ResponseField;
import javax.annotation.Nonnull;
import java.util.Collections;
import java.util.List;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;
import java.util.LinkedHashMap;
import java.util.Map;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.InputFieldWriter;
import java.io.IOException;

@Generated("Apollo GraphQL")
public final class NestedQuery implements Query<NestedQuery.Data, NestedQuery.Data, Operation.Variables> {
  public static final String OPERATION_DEFINITION = "query Nested {   nested }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "Nested";
    }
  };
  private final Operation.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public NestedQuery.Data wrapData(NestedQuery.Data data) {
    return data;
  }
  
  @Override
   public Operation.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<NestedQuery.Data> responseFieldMapper() {
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
    return "cddabe3e6621261c404a32e0f592f072";
  }
  
  public NestedQuery() {
    this.variables = Operation.EMPTY_VARIABLES;
  }
  public static class Data implements Operation.Data {
    private final @Nonnull List<List<String>> nested;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("nested", "nested", null, false, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nonnull List<List<String>> nested) {
      this.nested = Utils.checkNotNull(nested, "nested == null");
    }
    
    public @Nonnull List<List<String>> nested() {
      return this.nested;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "nested=" + nested + ", "
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
        return this.nested.equals(that.nested);
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= nested.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeList($responseFields[0], nested, new ResponseWriter.ListWriter() {
            @Override
            public void write(Object value, ResponseWriter.ListItemWriter listItemWriter) {
              listItemWriter.writeString(((String) value));
            }
          });
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Data> {
      @Override
       public Data map(ResponseReader reader) {
        final List<List<String>> nested = reader.readList($responseFields[0], new ResponseReader.ListReader<List<String>>() {
          @Override
          public List<String> read(ResponseReader.ListItemReader listItemReader) {
            return listItemReader.readList(new ResponseReader.ListReader<String>() {
              @Override
              public String read(ResponseReader.ListItemReader listItemReader) {
                return listItemReader.readString();
              }
            });
          }
        });
        return new Data(nested);
      }
    }
    
  }
  

  public static final class Builder {
    Builder() {
      
    }
    
    public NestedQuery build() {
      return new NestedQuery();
    }
  }
  

  public static final class Variables extends Operation.Variables {
    private final transient Map<String, Object> valueMap = new LinkedHashMap<>();
    public Variables() {
      
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
      
        }
      };
    }
  }
  
}

