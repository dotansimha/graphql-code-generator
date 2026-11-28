import { buildSchema, parse, print, type DocumentNode, type GraphQLSchema } from 'graphql';

/**
 * One setting of a config option. The first variant of a `ConfigExample` is the baseline (usually the default).
 */
export interface ConfigExampleVariant {
  /** Label shown in `// <label>` comments. Defaults to `key=value` pairs built from `config`. */
  label?: string;
  config: Record<string, unknown>;
}

export interface ConfigExample {
  /** Config option name, used as the section heading. */
  option: string;
  /** Sub-heading, when an option has several examples. */
  title?: string;
  /** Short explanation rendered above the example. */
  note?: string;
  /** Minimal schema SDL for this option. */
  schema: string;
  /** Minimal operation(s) and fragment(s) for this option. */
  operation: string;
  /** Config applied to every variant (e.g. a prerequisite option). */
  sharedConfig?: Record<string, unknown>;
  /** Overrides how `sharedConfig` is displayed. `false` hides it. */
  sharedConfigLabel?: string | false;
  /** Extra code blocks shown before the schema (e.g. an external fragment). */
  extraBlocks?: Array<{ label: string; lang: string; code: string }>;
  /** Settings to compare. The first one is the baseline. */
  variants: [ConfigExampleVariant, ...ConfigExampleVariant[]];
  /** Show each variant's full output instead of merging (for options that restructure the whole file). */
  showWholeOutput?: boolean;
  /** Mutate the built schema before generating (e.g. to set enum internal values). */
  prepareSchema?: (schema: GraphQLSchema) => void;
}

export type ConfigExampleGenerate = (
  schema: GraphQLSchema,
  document: DocumentNode,
  config: Record<string, unknown>,
) => Promise<string> | string;

/**
 * Runs `generate` once per variant of every example, and renders the results as Markdown.
 * For each example, only the declarations that differ between variants are shown.
 * Lines that differ are printed once per variant, each followed by a `// <label>` comment.
 */
export async function renderConfigExamples(
  examples: ConfigExample[],
  options: { generate: ConfigExampleGenerate; title: string; intro?: string },
): Promise<string> {
  const md: string[] = [`# ${options.title}`, ''];
  if (options.intro) {
    md.push(options.intro, '');
  }

  const byOption = new Map<string, ConfigExample[]>();
  for (const example of examples) {
    byOption.set(example.option, [...(byOption.get(example.option) ?? []), example]);
  }

  for (const [option, optionExamples] of byOption) {
    md.push(`## \`${option}\``, '');
    for (const example of optionExamples) {
      md.push(...(await renderExample(example, options.generate)));
    }
  }

  return (
    md
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  );
}

async function renderExample(
  example: ConfigExample,
  generate: ConfigExampleGenerate,
): Promise<string[]> {
  const out: string[] = [];
  if (example.title) {
    out.push(`### ${example.title}`, '');
  }
  if (example.note) {
    out.push(`> ${example.note}`, '');
  }
  if (example.sharedConfig && example.sharedConfigLabel !== false) {
    out.push(
      `Shared config: \`${example.sharedConfigLabel ?? formatValue(example.sharedConfig)}\``,
      '',
    );
  }
  for (const block of example.extraBlocks ?? []) {
    out.push(`**${block.label}**`, '', '```' + block.lang, block.code.trim(), '```', '');
  }

  const schemaSdl = print(parse(example.schema));
  const operation = print(parse(example.operation));
  out.push('**Schema**', '', '```graphql', schemaSdl, '```', '');
  out.push('**Operation**', '', '```graphql', operation, '```', '');

  const results: Array<[label: string, lines: string[]]> = [];
  const errors: string[] = [];
  for (const variant of example.variants) {
    const label = variant.label ?? formatConfigLabel(variant.config);
    try {
      const schema = buildSchema(example.schema);
      example.prepareSchema?.(schema);
      const output = await generate(schema, parse(example.operation), {
        ...example.sharedConfig,
        ...variant.config,
      });
      results.push([label, output.replace(/^\n+|\n+$/g, '').split('\n')]);
    } catch (e) {
      errors.push(`// ${label} → throws: ${(e as Error).message}`);
    }
  }

  let body =
    results.length === 0
      ? []
      : example.showWholeOutput
        ? wholeOutputs(results)
        : mergeVariants(results);
  if (results.length > 0 && body.length === 0) {
    body = ['// Output is identical for every setting:', '', ...withoutPreamble(results[0][1])];
  }
  if (errors.length > 0) {
    body = [...body, '', ...errors];
  }

  out.push('**Generated TypeScript**', '', '```ts', trimBlankLines(body).join('\n'), '```', '');
  return out;
}

/** Formats a config value the way it would be written in codegen.ts. */
function formatValue(value: unknown): string {
  if (typeof value === 'string') return `'${value}'`;
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (value && typeof value === 'object') {
    return `{ ${Object.entries(value)
      .map(([k, v]) => `${k}: ${formatValue(v)}`)
      .join(', ')} }`;
  }
  return String(value);
}

function formatConfigLabel(config: Record<string, unknown>): string {
  return Object.entries(config)
    .map(([k, v]) => `${k}=${formatValue(v)}`)
    .join(', ');
}

function trimBlankLines(lines: string[]): string[] {
  const res: string[] = [];
  for (const line of lines) {
    if (line.trim() === '' && (res.length === 0 || res[res.length - 1] === '')) continue;
    res.push(line.trim() === '' ? '' : line);
  }
  while (res.length > 0 && res[res.length - 1] === '') res.pop();
  return res;
}

const PREAMBLE =
  /^(\/\*\* Internal type\. DO NOT USE DIRECTLY\. \*\/|type Exact<|export type Incremental<)/;

function withoutPreamble(lines: string[]): string[] {
  return lines.filter(l => !PREAMBLE.test(l));
}

function wholeOutputs(results: Array<[string, string[]]>): string[] {
  let common = 0;
  while (results.every(([, l]) => l.length > common && l[common] === results[0][1][common]))
    common++;
  return results.flatMap(([label, lines]) => [
    '',
    `// ${label}`,
    ...trimBlankLines(lines.slice(common)),
  ]);
}

type Opcode = ['equal' | 'replace' | 'insert' | 'delete', number, number, number, number];

/** Line diff (LCS), returned as difflib-style opcodes. */
function opcodes(a: string[], b: string[]): Opcode[] {
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const ops: Opcode[] = [];
  const push = (tag: Opcode[0], i1: number, i2: number, j1: number, j2: number) => {
    const last = ops[ops.length - 1];
    if (last && last[0] === tag && last[2] === i1 && last[4] === j1) {
      last[2] = i2;
      last[4] = j2;
    } else {
      ops.push([tag, i1, i2, j1, j2]);
    }
  };
  let i = 0;
  let j = 0;
  let gi = 0;
  let gj = 0;
  const flushGap = () => {
    if (gi < i || gj < j) {
      push(gi < i && gj < j ? 'replace' : gi < i ? 'delete' : 'insert', gi, i, gj, j);
    }
  };
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      flushGap();
      push('equal', i, i + 1, j, j + 1);
      i++;
      j++;
      gi = i;
      gj = j;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  i = n;
  j = m;
  flushGap();
  return ops;
}

const CONTINUATION = /^(\s|\}|\||\)|&)/;

/** Splits output lines into top-level statements: [start, end) ranges. A one-line JSDoc attaches to the next line. */
function statements(lines: string[]): Array<[number, number]> {
  const st: Array<[number, number]> = [];
  let cur: number | null = null;
  let pendingDeclaration: number | null = null;
  for (const [i, line] of lines.entries()) {
    if (line.trim() === '') {
      if (cur !== null) st.push([cur, i]);
      cur = null;
      continue;
    }
    if (CONTINUATION.test(line) && cur !== null) continue;
    const next = lines[i + 1];
    if (
      line.startsWith('/**') &&
      line.trimEnd().endsWith('*/') &&
      next?.trim() &&
      !next.startsWith('/**')
    ) {
      if (cur !== null && pendingDeclaration !== i) st.push([cur, i]);
      cur = i;
      pendingDeclaration = i + 1;
      continue;
    }
    if (pendingDeclaration === i) {
      pendingDeclaration = null;
      continue;
    }
    if (cur !== null) st.push([cur, i]);
    cur = i;
  }
  if (cur !== null) st.push([cur, lines.length]);
  return st;
}

/**
 * Merges the outputs of several variants against the first one.
 * - Lines changed one-for-one are printed once per variant with a trailing `// <label>`.
 * - Declarations whose shape changes are printed whole, once per variant, under a `// <label>` line.
 * - Declarations that only some variants generate are marked `(added)` / `(not generated)`.
 */
function mergeVariants(vs: Array<[string, string[]]>): string[] {
  const base = vs[0][1];
  const labels = vs.map(([label]) => label);
  const stmts = statements(base);
  const stmtIndex = (i: number) => stmts.findIndex(([s, e]) => s <= i && i < e);

  const lineChanges = new Map<number, Map<number, string>>();
  const declChanges = new Set<number>();
  const added = new Map<number, Array<[number, string[]]>>();
  const allOps = vs.map(([, lines]) => opcodes(base, lines));

  for (const [k, [, lines]] of vs.entries()) {
    if (k === 0) continue;
    for (const [tag, i1, i2, j1, j2] of allOps[k]) {
      if (tag === 'equal') continue;
      if (tag === 'replace' && i2 - i1 === j2 - j1) {
        let allInStatements = true;
        for (let t = i1; t < i2; t++) if (stmtIndex(t) === -1) allInStatements = false;
        if (allInStatements) {
          for (let t = 0; t < i2 - i1; t++) {
            if (!lineChanges.has(i1 + t)) lineChanges.set(i1 + t, new Map());
            lineChanges.get(i1 + t)!.set(k, lines[j1 + t]);
          }
          continue;
        }
      }
      const inserted = lines.slice(j1, j2);
      const before = stmtIndex(i1 - 1);
      const after = stmtIndex(i1);
      const firstContent = inserted.find(l => l.trim()) ?? '';
      if (
        tag === 'insert' &&
        (before === -1 || after === -1 || before !== after) &&
        inserted.length > 0 &&
        !CONTINUATION.test(firstContent)
      ) {
        const body = trimBlankLines(inserted);
        if (body.length > 0) {
          if (!added.has(i1)) added.set(i1, []);
          added.get(i1)!.push([k, body]);
        }
        continue;
      }
      const touched = new Set<number>();
      for (let i = i1; i < i2; i++) if (stmtIndex(i) !== -1) touched.add(stmtIndex(i));
      if (touched.size === 0) {
        const n = before === -1 ? after : before;
        if (n !== -1) touched.add(n);
      }
      for (const n of touched) declChanges.add(n);
    }
  }

  for (const i of lineChanges.keys()) {
    if (declChanges.has(stmtIndex(i))) lineChanges.delete(i);
  }
  const shown = new Set([...[...lineChanges.keys()].map(stmtIndex), ...declChanges]);

  const mapIndex = (k: number, i: number, start: boolean): number => {
    for (const [tag, i1, i2, j1] of allOps[k]) {
      if (tag === 'equal' && i1 <= i && i < i2) return j1 + (i - i1);
      if (tag === 'equal' && i === i2 && !start) return j1 + (i2 - i1);
    }
    for (const [tag, i1, i2, j1, j2] of allOps[k]) {
      if (tag !== 'equal' && i1 <= i && i <= i2) return start ? j1 : j2;
    }
    return vs[k][1].length;
  };

  const out: string[] = [];
  const emitGroup = (candidates: Array<[string, string[]]>) => {
    const groups: Array<[string[], string[]]> = [];
    for (const [label, lines] of candidates) {
      const g = groups.find(
        ([l]) => l.length === lines.length && l.every((x, idx) => x === lines[idx]),
      );
      if (g) g[1].push(label);
      else groups.push([lines, [label]]);
    }
    for (const [lines, groupLabels] of groups) {
      const label = groupLabels.join(', ');
      if (lines.length === 0) out.push(`// ${label}: (not generated)`);
      else if (lines.length === 1) out.push(`${lines[0]} // ${label}`);
      else out.push(`// ${label}`, ...lines);
    }
  };
  const emitAdded = (pos: number) => {
    for (const [k, body] of added.get(pos) ?? []) {
      out.push('');
      if (body.length === 1) out.push(`${body[0]} // ${labels[k]}`);
      else out.push(`// ${labels[k]}: (added)`, ...body);
    }
  };

  let n = 0;
  while (n < stmts.length) {
    const [s, e] = stmts[n];
    emitAdded(s);
    if (declChanges.has(n)) {
      let m = n;
      while (m + 1 < stmts.length && declChanges.has(m + 1)) m++;
      const a = stmts[n][0];
      const b = stmts[m][1];
      const candidates: Array<[string, string[]]> = [[labels[0], base.slice(a, b)]];
      for (let k = 1; k < vs.length; k++) {
        candidates.push([
          labels[k],
          trimBlankLines(vs[k][1].slice(mapIndex(k, a, true), mapIndex(k, b, false))),
        ]);
      }
      out.push('');
      emitGroup(candidates);
      n = m + 1;
      continue;
    }
    if (shown.has(n)) {
      out.push('');
      for (let i = s; i < e; i++) {
        const changes = lineChanges.get(i);
        if (changes) {
          emitGroup([
            [labels[0], [base[i]]],
            ...labels
              .slice(1)
              .map((label, idx): [string, string[]] => [label, [changes.get(idx + 1) ?? base[i]]]),
          ]);
        } else {
          out.push(base[i]);
        }
      }
    }
    n++;
  }
  emitAdded(base.length);
  return trimBlankLines(out);
}
