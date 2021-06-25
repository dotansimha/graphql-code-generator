export const tsup: import('tsup').Options = {
  target: 'es2019',
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  ignoreWatch: ['src/ez.generated.ts'],
};
