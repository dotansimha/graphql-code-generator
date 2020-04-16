---
id: config-field
title: "`config` field"
---

The `config` field is used to pass configuration to Plugins. You can specify it in multiple levels of your `.yml` file.

It's a basic key-value map.

### Root Level

If you specify it in your root level, every plugin for each output file will get the config value:

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

If you specify it at the output file level, every plugin for specific output will get the config value:

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

> Output level configuration overrides root level configuration.

### Plugin Level

If you specify it at the plugin level, only that plugin will get the config value:

```yml
schema: schema.graphql
generates:
  output.ts:
    - plugin1:
        configKey: configValue
    - plugin2:
        configKey: otherValue
```

> Plugin level configuration overrides output-level and root-level configuration.
