export const EXAMPLES = {
  'typescript-server': {
    config: `generates:
  live-demo-test.ts:
    - typescript-common
    - typescript-client
    - typescript-server`,

    schema: `type Query {
  f: String
}`,

    document: `query f {
  f
}`
  }
};
