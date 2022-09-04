import { DefaultFreezedPluginConfig } from '../src/utils';

export const defaultConfig = new DefaultFreezedPluginConfig();

export const typeConfig = new DefaultFreezedPluginConfig({
  globalFreezedConfig: {
    unionValueCase: 'FreezedUnionCase.camel',
  },
  typeSpecificFreezedConfig: {
    Starship: {
      config: {
        alwaysUseJsonKeyName: true,
        copyWith: false,
        unionValueCase: 'FreezedUnionCase.pascal',
      },
    },
  },
});

export const customDecoratorsConfig = new DefaultFreezedPluginConfig({
  globalFreezedConfig: {
    customDecorators: {
      '@JsonSerializable(explicitToJson: true)': {
        applyOn: ['class'],
        mapsToFreezedAs: 'custom',
      },
    },
  },
  typeSpecificFreezedConfig: {
    Droid: {
      config: {
        customDecorators: {
          '@FreezedUnionValue': {
            applyOn: ['union_factory'],
            arguments: ["'BestDroid'"],
            mapsToFreezedAs: 'custom',
          },
        },
      },
      fields: {
        id: {
          customDecorators: {
            '@NanoId': {
              applyOn: ['union_factory_parameter'],
              arguments: ['size: 16', 'alphabets: NanoId.ALPHA_NUMERIC'],
              mapsToFreezedAs: 'custom',
            },
          },
        },
      },
    },
  },
});

export const fullDemoConfig = new DefaultFreezedPluginConfig({
  camelCasedEnums: true,
  fileName: 'app_models',
  customScalars: {
    jsonb: 'Map<String, dynamic>',
    timestamptz: 'DateTime',
    UUID: 'String',
  },
  ignoreTypes: [],
  globalFreezedConfig: {
    immutable: true,
    privateEmptyConstructor: true,
    mergeInputs: ['Create$Input', 'Upsert$Input', 'Delete$Input'],
    defaultUnionConstructor: true,
    mutableInputs: true,
    customDecorators: {
      '@JsonSerializable(explicitToJson: true)': {
        applyOn: ['class'],
        mapsToFreezedAs: 'custom',
      },
    },
  },
  typeSpecificFreezedConfig: {
    Base: {
      config: {
        mergeInputs: ['$AInput', '$BInput', 'BaseCInput', 'CreateMovieInput'],
      },
    },
    Starship: {
      config: {
        alwaysUseJsonKeyName: true,
        copyWith: false,
        equal: false,
        privateEmptyConstructor: false,
        unionValueCase: 'FreezedUnionCase.pascal',
      },
    },
    Droid: {
      config: {
        immutable: false,
        fromJsonToJson: false,
        customDecorators: {
          '@FreezedUnionValue': {
            applyOn: ['union_factory'],
            arguments: ["'BestDroid'"],
            mapsToFreezedAs: 'custom',
          },
        },
      },
      fields: {
        id: {
          customDecorators: {
            '@NanoId': {
              applyOn: ['union_factory_parameter'],
              arguments: ['size: 16', 'alphabets: NanoId.ALPHA_NUMERIC'],
              mapsToFreezedAs: 'custom',
            },
          },
        },
      },
    },
  },
});
