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
public final class SomethingQuery implements Query<SomethingQuery.Data, SomethingQuery.Data, Operation.Variables> {
  public static final String OPERATION_DEFINITION = "query Something {   something }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "Something";
    }
  };
  private final Operation.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public SomethingQuery.Data wrapData(SomethingQuery.Data data) {
    return data;
  }
  
  @Override
   public Operation.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<SomethingQuery.Data> responseFieldMapper() {
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
    return "a9e79832309f8b549d253fe85b094a50";
  }
  
  public SomethingQuery() {
    this.variables = Operation.EMPTY_VARIABLES;
  }
  public static class Data implements Operation.Data {
    private final @Nonnull List<String> something;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("something", "something", null, false, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nonnull List<String> something) {
      this.something = Utils.checkNotNull(something, "something == null");
    }
    
    public @Nonnull List<String> something() {
      return this.something;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "something=" + something + ", "
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
        return this.something.equals(that.something);
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= something.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeList($responseFields[0], something, new ResponseWriter.ListWriter() {
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
        final List<String> something = reader.readList($responseFields[0], new ResponseReader.ListReader<String>() {
          @Override
          public String read(ResponseReader.ListItemReader listItemReader) {
            return listItemReader.readString();
          }
        });
        return new Data(something);
      }
    }
    
  }
  

  public static final class Builder {
    Builder() {
      
    }
    
    public SomethingQuery build() {
      return new SomethingQuery();
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
