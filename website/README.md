# GraphQL Code Generator docs

The documentation at [the-guild.dev/graphql/codegen](https://the-guild.dev/graphql/codegen) is
authored here and rendered by [the-guild-org/website](https://github.com/the-guild-org/website),
which fetches this folder at build time. Nothing in this folder is built or deployed on its own.

## Layout

| Path                  | What it is                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content/docs/`       | The Documentation section. Folder order and titles come from each folder's `meta.json`.                                                                                                                           |
| `content/plugins/`    | One page per plugin or preset, grouped by category folder. The folder decides the plugin's category and URL: `content/plugins/typescript/typescript-resolvers.mdx` is `/plugins/typescript/typescript-resolvers`. |
| `content/partials/`   | MDX fragments imported by several pages.                                                                                                                                                                          |
| `assets/`             | Images referenced from pages as `/assets/...`.                                                                                                                                                                    |
| `icons/`              | Plugin icons referenced by name from `plugins.json`.                                                                                                                                                              |
| `plugins.json`        | The plugin registry: title, npm package, icon, and tags for every plugin page. The key must match the page's file name.                                                                                           |
| `plugin-configs.json` | Where each plugin's config type lives, for the schema generator and the per-plugin Config API Reference.                                                                                                          |
| `config.schema.json`  | Generated JSON Schema for `codegen.ts` / `codegen.yml`. Regenerate with `pnpm --filter website generate-config-schema` after changing a plugin's config type or `plugin-configs.json`.                            |

## Writing pages

- Frontmatter: `title` (required) and `description`. The site renders the title as the page heading,
  so pages do not start with an `# H1`. Use `sidebarTitle` when the sidebar should show a shorter
  label.
- Ordering: each folder's `meta.json` lists `pages` in display order; a folder's `title` is its
  sidebar label.
- Plugin pages carry two optional flags: `isDev: false` when the package is a runtime dependency
  (the install snippet drops `-D`), and `hasOperationsNote: true` to show the "requires GraphQL
  operations" callout. The plugin header, install snippet, npm badges, and Config API Reference are
  rendered by the site; the page body is the prose that follows them.
- Components available without importing: `Callout`, `Tabs`, `Cards`, `FileTree`. Name code blocks
  with ` ```ts title="codegen.ts" `.

## Previewing changes

Every pull request that touches this folder gets a preview at
`https://codegen-pr-<number>.guild-dev-website.pages.dev/graphql/codegen` (linked in a PR comment
within about ten minutes). Merges to `master` redeploy the live docs automatically.
