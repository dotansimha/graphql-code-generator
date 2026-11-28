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
  prepareSchema?: (params: { schema: GraphQLSchema }) => void;
}

export type ConfigExampleGenerate = (params: {
  schema: GraphQLSchema;
  document: DocumentNode;
  config: Record<string, unknown>;
}) => Promise<string> | string;

/**
 * Runs `generate` once per variant of every example, and renders the results as Markdown.
 * For each example, only the declarations that differ between variants are shown.
 * Lines that differ are printed once per variant, each followed by a `// <label>` comment.
 */
export async function renderConfigExamples({
  examples,
  generate,
  title,
  intro,
}: {
  examples: ConfigExample[];
  generate: ConfigExampleGenerate;
  title: string;
  intro?: string;
}): Promise<string> {
  /** Formats a config value the way it would be written in codegen.ts. */
  const formatValue = ({ value }: { value: unknown }): string => {
    if (typeof value === 'string') {
      return `'${value}'`;
    }
    if (Array.isArray(value)) {
      return `[${value.map(item => formatValue({ value: item })).join(', ')}]`;
    }
    if (value && typeof value === 'object') {
      return `{ ${Object.entries(value)
        .map(([key, entryValue]) => `${key}: ${formatValue({ value: entryValue })}`)
        .join(', ')} }`;
    }
    return String(value);
  };

  /** Drops leading, trailing and repeated blank lines, and empties whitespace-only lines. */
  const trimBlankLines = ({ lines }: { lines: string[] }): string[] => {
    const result: string[] = [];
    for (const line of lines) {
      if (line.trim() === '' && (result.length === 0 || result[result.length - 1] === '')) {
        continue;
      }
      result.push(line.trim() === '' ? '' : line);
    }
    while (result.length > 0 && result[result.length - 1] === '') {
      result.pop();
    }
    return result;
  };

  /**
   * Merges the outputs of several variants against the first one.
   * - Lines changed one-for-one are printed once per variant with a trailing `// <label>`.
   * - Declarations whose shape changes are printed whole, once per variant, under a `// <label>` line.
   * - Declarations that only some variants generate are marked `(added)` / `(not generated)`.
   *
   * e.g. `[['default', ['type A = string;']], ['x=true', ['type A = number;']]]`
   * → `['type A = string; // default', 'type A = number; // x=true']`
   */
  const mergeVariants = ({
    variantOutputs,
  }: {
    variantOutputs: Array<[string, string[]]>;
  }): string[] => {
    const continuation = /^(\s|\}|\||\)|&)/;

    type Opcode = ['equal' | 'replace' | 'insert' | 'delete', number, number, number, number];

    /**
     * Line diff (LCS), returned as difflib-style opcodes: `[tag, baseStart, baseEnd, otherStart, otherEnd]`.
     *
     * e.g. base `['a', 'b', 'c']`, other `['a', 'x', 'c']`
     * → `[['equal', 0, 1, 0, 1], ['replace', 1, 2, 1, 2], ['equal', 2, 3, 2, 3]]`
     */
    const opcodes = ({ base, other }: { base: string[]; other: string[] }): Opcode[] => {
      const baseLength = base.length;
      const otherLength = other.length;
      const lcs = Array.from({ length: baseLength + 1 }, () =>
        new Array<number>(otherLength + 1).fill(0),
      );
      for (let baseIndex = baseLength - 1; baseIndex >= 0; baseIndex--) {
        for (let otherIndex = otherLength - 1; otherIndex >= 0; otherIndex--) {
          lcs[baseIndex][otherIndex] =
            base[baseIndex] === other[otherIndex]
              ? lcs[baseIndex + 1][otherIndex + 1] + 1
              : Math.max(lcs[baseIndex + 1][otherIndex], lcs[baseIndex][otherIndex + 1]);
        }
      }
      const ops: Opcode[] = [];
      const push = ({
        tag,
        baseStart,
        baseEnd,
        otherStart,
        otherEnd,
      }: {
        tag: Opcode[0];
        baseStart: number;
        baseEnd: number;
        otherStart: number;
        otherEnd: number;
      }): void => {
        const last = ops[ops.length - 1];
        if (last && last[0] === tag && last[2] === baseStart && last[4] === otherStart) {
          last[2] = baseEnd;
          last[4] = otherEnd;
        } else {
          ops.push([tag, baseStart, baseEnd, otherStart, otherEnd]);
        }
      };
      let baseIndex = 0;
      let otherIndex = 0;
      let baseGapStart = 0;
      let otherGapStart = 0;
      const flushGap = (): void => {
        if (baseGapStart < baseIndex || otherGapStart < otherIndex) {
          const tag =
            baseGapStart < baseIndex && otherGapStart < otherIndex
              ? 'replace'
              : baseGapStart < baseIndex
                ? 'delete'
                : 'insert';
          push({
            tag,
            baseStart: baseGapStart,
            baseEnd: baseIndex,
            otherStart: otherGapStart,
            otherEnd: otherIndex,
          });
        }
      };
      while (baseIndex < baseLength && otherIndex < otherLength) {
        if (base[baseIndex] === other[otherIndex]) {
          flushGap();
          push({
            tag: 'equal',
            baseStart: baseIndex,
            baseEnd: baseIndex + 1,
            otherStart: otherIndex,
            otherEnd: otherIndex + 1,
          });
          baseIndex++;
          otherIndex++;
          baseGapStart = baseIndex;
          otherGapStart = otherIndex;
        } else if (lcs[baseIndex + 1][otherIndex + 1] === lcs[baseIndex][otherIndex]) {
          baseIndex++;
          otherIndex++;
        } else if (lcs[baseIndex + 1][otherIndex] >= lcs[baseIndex][otherIndex + 1]) {
          baseIndex++;
        } else {
          otherIndex++;
        }
      }
      baseIndex = baseLength;
      otherIndex = otherLength;
      flushGap();
      return ops;
    };

    /**
     * Splits output lines into top-level statements: [start, end) ranges. A one-line JSDoc attaches to the next line.
     *
     * e.g. `['type A = {', '  a: string;', '};', '', '/** Doc *\/', 'type B = string;']`
     * → `[[0, 3], [4, 6]]`
     */
    const statements = ({ lines }: { lines: string[] }): Array<[number, number]> => {
      const ranges: Array<[number, number]> = [];
      let current: number | null = null;
      let pendingDeclaration: number | null = null;
      for (const [lineIndex, line] of lines.entries()) {
        if (line.trim() === '') {
          if (current !== null) {
            ranges.push([current, lineIndex]);
          }
          current = null;
          continue;
        }
        if (continuation.test(line) && current !== null) {
          continue;
        }
        const next = lineIndex + 1 < lines.length ? lines[lineIndex + 1] : '';
        if (
          line.startsWith('/**') &&
          line.trimEnd().endsWith('*/') &&
          next.trim() &&
          !next.startsWith('/**')
        ) {
          if (current !== null && pendingDeclaration !== lineIndex) {
            ranges.push([current, lineIndex]);
          }
          current = lineIndex;
          pendingDeclaration = lineIndex + 1;
          continue;
        }
        if (pendingDeclaration === lineIndex) {
          pendingDeclaration = null;
          continue;
        }
        if (current !== null) {
          ranges.push([current, lineIndex]);
        }
        current = lineIndex;
      }
      if (current !== null) {
        ranges.push([current, lines.length]);
      }
      return ranges;
    };

    const declaredName = /^export (?:type|interface|enum|const) (\w+)/;

    /**
     * Reorders a variant's statements so that those declaring the same name as a base statement follow the base order.
     * A statement with no matching name stays after the statement before it. Blank-line gaps stay in place.
     *
     * e.g. base `['export type A = 1;', '', 'export type B = 2;']`, other `['export type B = 3;', '', 'export type A = 4;']`
     * → `['export type A = 4;', '', 'export type B = 3;']`
     */
    const alignByName = ({ base, other }: { base: string[]; other: string[] }): string[] => {
      const baseOrder = new Map<string, number>();
      for (const [statementIndex, [start, end]] of statements({ lines: base }).entries()) {
        const name = base
          .slice(start, end)
          .map(line => declaredName.exec(line)?.[1])
          .find(Boolean);
        if (name && !baseOrder.has(name)) {
          baseOrder.set(name, statementIndex);
        }
      }
      const otherRanges = statements({ lines: other });
      if (otherRanges.length === 0) {
        return other;
      }
      let previousKey = -1;
      const keyed = otherRanges.map(([start, end]) => {
        const name = other
          .slice(start, end)
          .map(line => declaredName.exec(line)?.[1])
          .find(Boolean);
        const order = name ? baseOrder.get(name) : undefined;
        previousKey = order ?? previousKey;
        return { start, end, key: previousKey, matched: order !== undefined };
      });
      const sorted = [...keyed].sort(
        (left, right) => left.key - right.key || Number(right.matched) - Number(left.matched),
      );
      const aligned = other.slice(0, otherRanges[0][0]);
      for (const [position, [, end]] of otherRanges.entries()) {
        const gapEnd =
          position + 1 < otherRanges.length ? otherRanges[position + 1][0] : other.length;
        aligned.push(
          ...other.slice(sorted[position].start, sorted[position].end),
          ...other.slice(end, gapEnd),
        );
      }
      return aligned;
    };

    const base = variantOutputs[0][1];
    const alignedOutputs = variantOutputs.map(
      ([label, lines], variantIndex): [string, string[]] => [
        label,
        variantIndex === 0 ? lines : alignByName({ base, other: lines }),
      ],
    );
    const labels = variantOutputs.map(([label]) => label);
    const stmts = statements({ lines: base });
    const stmtIndex = ({ lineIndex }: { lineIndex: number }): number =>
      stmts.findIndex(([start, end]) => start <= lineIndex && lineIndex < end);

    const lineChanges = new Map<number, Map<number, string>>();
    const declChanges = new Set<number>();
    const added = new Map<number, Array<[number, string[]]>>();
    const allOps = alignedOutputs.map(([, lines]) => opcodes({ base, other: lines }));

    for (const [variantIndex, [, lines]] of alignedOutputs.entries()) {
      if (variantIndex === 0) {
        continue;
      }
      for (const [tag, baseStart, baseEnd, otherStart, otherEnd] of allOps[variantIndex]) {
        if (tag === 'equal') {
          continue;
        }
        if (tag === 'replace' && baseEnd - baseStart === otherEnd - otherStart) {
          let allInStatements = true;
          for (let lineIndex = baseStart; lineIndex < baseEnd; lineIndex++) {
            if (stmtIndex({ lineIndex }) === -1) {
              allInStatements = false;
            }
          }
          if (allInStatements) {
            for (let offset = 0; offset < baseEnd - baseStart; offset++) {
              const changes = lineChanges.get(baseStart + offset) || new Map<number, string>();
              changes.set(variantIndex, lines[otherStart + offset]);
              lineChanges.set(baseStart + offset, changes);
            }
            continue;
          }
        }
        const inserted = lines.slice(otherStart, otherEnd);
        const before = stmtIndex({ lineIndex: baseStart - 1 });
        const after = stmtIndex({ lineIndex: baseStart });
        const firstContent = inserted.find(line => line.trim()) ?? '';
        if (
          tag === 'insert' &&
          (before === -1 || after === -1 || before !== after) &&
          inserted.length > 0 &&
          !continuation.test(firstContent)
        ) {
          const body = trimBlankLines({ lines: inserted });
          if (body.length > 0) {
            const addedHere = added.get(baseStart) || [];
            addedHere.push([variantIndex, body]);
            added.set(baseStart, addedHere);
          }
          continue;
        }
        const touched = new Set<number>();
        for (let lineIndex = baseStart; lineIndex < baseEnd; lineIndex++) {
          if (stmtIndex({ lineIndex }) !== -1) {
            touched.add(stmtIndex({ lineIndex }));
          }
        }
        if (touched.size === 0) {
          const nearest = before === -1 ? after : before;
          if (nearest !== -1) {
            touched.add(nearest);
          }
        }
        for (const touchedIndex of touched) {
          declChanges.add(touchedIndex);
        }
      }
    }

    for (const lineIndex of lineChanges.keys()) {
      if (declChanges.has(stmtIndex({ lineIndex }))) {
        lineChanges.delete(lineIndex);
      }
    }
    const shown = new Set([
      ...[...lineChanges.keys()].map(lineIndex => stmtIndex({ lineIndex })),
      ...declChanges,
    ]);

    /**
     * Maps a base line index to the matching line index in a variant's output. `start` selects the start or the end of a changed range.
     *
     * e.g. base `['a', 'b', 'c']`, other `['a', 'x', 'y', 'c']`
     * → `{ lineIndex: 1, start: true }` → `1`, `{ lineIndex: 2, start: false }` → `3`, so the variant's slice is `['x', 'y']`
     */
    const mapIndex = ({
      variantIndex,
      lineIndex,
      start,
    }: {
      variantIndex: number;
      lineIndex: number;
      start: boolean;
    }): number => {
      for (const [tag, baseStart, baseEnd, otherStart] of allOps[variantIndex]) {
        if (tag === 'equal' && baseStart <= lineIndex && lineIndex < baseEnd) {
          return otherStart + (lineIndex - baseStart);
        }
        if (tag === 'equal' && lineIndex === baseEnd && !start) {
          return otherStart + (baseEnd - baseStart);
        }
      }
      for (const [tag, baseStart, baseEnd, otherStart, otherEnd] of allOps[variantIndex]) {
        if (tag !== 'equal' && baseStart <= lineIndex && lineIndex <= baseEnd) {
          return start ? otherStart : otherEnd;
        }
      }
      return alignedOutputs[variantIndex][1].length;
    };

    const out: string[] = [];
    const emitGroup = ({ candidates }: { candidates: Array<[string, string[]]> }): void => {
      const groups: Array<[string[], string[]]> = [];
      for (const [label, lines] of candidates) {
        const group = groups.find(
          ([groupLines]) =>
            groupLines.length === lines.length &&
            groupLines.every((groupLine, index) => groupLine === lines[index]),
        );
        if (group) {
          group[1].push(label);
        } else {
          groups.push([lines, [label]]);
        }
      }
      for (const [lines, groupLabels] of groups) {
        const label = groupLabels.join(', ');
        if (lines.length === 0) {
          out.push(`// ${label}: (not generated)`);
        } else if (lines.length === 1) {
          out.push(`${lines[0]} // ${label}`);
        } else {
          out.push(`// ${label}`, ...lines);
        }
      }
    };
    const emitAdded = ({ position }: { position: number }): void => {
      for (const [variantIndex, body] of added.get(position) ?? []) {
        out.push('');
        if (body.length === 1) {
          out.push(`${body[0]} // ${labels[variantIndex]}`);
        } else {
          out.push(`// ${labels[variantIndex]}: (added)`, ...body);
        }
      }
    };

    let statementIndex = 0;
    while (statementIndex < stmts.length) {
      const [start, end] = stmts[statementIndex];
      emitAdded({ position: start });
      if (declChanges.has(statementIndex)) {
        let lastIndex = statementIndex;
        while (lastIndex + 1 < stmts.length && declChanges.has(lastIndex + 1)) {
          lastIndex++;
        }
        const rangeStart = stmts[statementIndex][0];
        const rangeEnd = stmts[lastIndex][1];
        const candidates: Array<[string, string[]]> = [
          [labels[0], base.slice(rangeStart, rangeEnd)],
        ];
        for (let variantIndex = 1; variantIndex < variantOutputs.length; variantIndex++) {
          candidates.push([
            labels[variantIndex],
            trimBlankLines({
              lines: alignedOutputs[variantIndex][1].slice(
                mapIndex({ variantIndex, lineIndex: rangeStart, start: true }),
                mapIndex({ variantIndex, lineIndex: rangeEnd, start: false }),
              ),
            }),
          ]);
        }
        out.push('');
        emitGroup({ candidates });
        statementIndex = lastIndex + 1;
        continue;
      }
      if (shown.has(statementIndex)) {
        out.push('');
        for (let lineIndex = start; lineIndex < end; lineIndex++) {
          const changes = lineChanges.get(lineIndex);
          if (changes) {
            emitGroup({
              candidates: [
                [labels[0], [base[lineIndex]]],
                ...labels
                  .slice(1)
                  .map((label, index): [string, string[]] => [
                    label,
                    [changes.get(index + 1) ?? base[lineIndex]],
                  ]),
              ],
            });
          } else {
            out.push(base[lineIndex]);
          }
        }
      }
      statementIndex++;
    }
    emitAdded({ position: base.length });
    return trimBlankLines({ lines: out });
  };

  const preamble =
    /^(\/\*\* Internal type\. DO NOT USE DIRECTLY\. \*\/|type Exact<|export type Incremental<)/;

  const md = [`# ${title}`, ''];
  if (intro) {
    md.push(intro, '');
  }

  const byOption = new Map<string, ConfigExample[]>();
  for (const example of examples) {
    byOption.set(example.option, [...(byOption.get(example.option) ?? []), example]);
  }

  for (const [option, optionExamples] of byOption) {
    md.push(`## \`${option}\``, '');
    for (const example of optionExamples) {
      if (example.title) {
        md.push(`### ${example.title}`, '');
      }
      if (example.note) {
        md.push(`> ${example.note}`, '');
      }
      if (example.sharedConfig && example.sharedConfigLabel !== false) {
        md.push(
          `Shared config: \`${example.sharedConfigLabel ?? formatValue({ value: example.sharedConfig })}\``,
          '',
        );
      }
      for (const block of example.extraBlocks ?? []) {
        md.push(`**${block.label}**`, '', '```' + block.lang, block.code.trim(), '```', '');
      }

      const schemaSdl = print(parse(example.schema));
      const operation = print(parse(example.operation));
      md.push('**Schema**', '', '```graphql', schemaSdl, '```', '');
      md.push('**Operation**', '', '```graphql', operation, '```', '');

      const results: Array<[label: string, lines: string[]]> = [];
      const errors: string[] = [];
      for (const variant of example.variants) {
        const label =
          variant.label ??
          Object.entries(variant.config)
            .map(([key, value]) => `${key}=${formatValue({ value })}`)
            .join(', ');
        const schema = buildSchema(example.schema);
        example.prepareSchema?.({ schema });
        try {
          const output = await generate({
            schema,
            document: parse(example.operation),
            config: { ...example.sharedConfig, ...variant.config },
          });
          results.push([label, output.replace(/^\n+|\n+$/g, '').split('\n')]);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`// ${label} → throws: ${message}`);
        }
      }

      let body: string[] = [];
      if (results.length > 0 && example.showWholeOutput) {
        let common = 0;
        while (
          results.every(
            ([, lines]) => lines.length > common && lines[common] === results[0][1][common],
          )
        ) {
          common++;
        }
        body = results.flatMap(([label, lines]) => [
          '',
          `// ${label}`,
          ...trimBlankLines({ lines: lines.slice(common) }),
        ]);
      } else if (results.length > 0) {
        body = mergeVariants({ variantOutputs: results });
      }
      if (results.length > 0 && body.length === 0) {
        body = [
          '// Output is identical for every setting:',
          '',
          ...results[0][1].filter(line => !preamble.test(line)),
        ];
      }
      if (errors.length > 0) {
        body = [...body, '', ...errors];
      }

      md.push(
        '**Generated TypeScript**',
        '',
        '```ts',
        trimBlankLines({ lines: body }).join('\n'),
        '```',
        '',
      );
    }
  }

  return (
    md
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  );
}
