export type JsonAttributesSource = 'Newtonsoft.Json' | 'System.Text.Json';

function unsupportedSource(attributesSource: JsonAttributesSource): void {
  throw new Error(`Unsupported JSON attributes source: ${attributesSource}`);
}

export class JsonAttributesSourceConfiguration {
  readonly namespace: string;
  readonly propertyAttribute: string;
  readonly requiredAttribute: string;

  constructor(namespace: string, propertyAttribute: string, requiredAttribute: string) {
    this.namespace = namespace;
    this.propertyAttribute = propertyAttribute;
    this.requiredAttribute = requiredAttribute;
  }
}

const newtonsoftConfiguration = new JsonAttributesSourceConfiguration(
  'Newtonsoft.Json',
  'JsonProperty',
  'JsonRequired'
);

// System.Text.Json does not have support of `JsonRequired` alternative (as for .NET 5)
const systemTextJsonConfiguration = new JsonAttributesSourceConfiguration(
  'System.Text.Json.Serialization',
  'JsonPropertyName',
  null
);

export function getJsonAttributeSourceConfiguration(attributesSource: JsonAttributesSource) {
  switch (attributesSource) {
    case 'Newtonsoft.Json':
      return newtonsoftConfiguration;
    case 'System.Text.Json':
      return systemTextJsonConfiguration;
  }
  unsupportedSource(attributesSource);
}
