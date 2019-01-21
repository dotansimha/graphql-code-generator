---
id: config-field
title: `config` field
---

The `config` field is used to pass configuration to Plugins. You can specify it in multiple levels of your `.yml` file.

It's a basic Key->Value map.

### Root Level

If you specify it in your root level, all plugins, of all output files will get the config value:

```yml
schema: schema.graphql
config:
  configKey: configValue
generates:
  output.ts:
    - plugin1
    - plugin2
```

### Output Level

You can also specify the `config` field per output, and then all plugins of that specific output will get the config value:

```yml
schema: schema.graphql
generates:
  output.ts:
    config:
      configKey: configValue
    plugins:
      - plugin1
      - plugin2
```

> Output level configuration overrides root-level config.

### Plugin Level

You can also specify configuration directly for specific plugin:

```yml
schema: schema.graphql
generates:
  output.ts:
    - plugin1:
        configKey: configValue
    - plugin2:
        configKey: otherValue
```

> Plugin level configuration overrides output-level and root-level config.
