---
'@graphql-codegen/cli': patch
---

Fix graphql-config loading order to correctly detect codegen projects

Previously, a `graphql-config` file like this failed:

```yml
projects:
  default:
    schema: 'default/schema.graphql'
  project1:
    schema: 'project1/schema.graphql'
    extensions:
      codegen:
        generates:
          'project1/__generated__/types.ts':
            plugins: ['typescript']
```

This is because the `default` project doesn't have a `codegen` extension, which caused previous logic to short circuit before reading `project1`'s config.

The fix reads every named project first, before reading the `default` project to exhaustively go through every single project.
