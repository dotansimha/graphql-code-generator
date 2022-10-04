/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as TJS from 'typescript-json-schema';
import { PluginConfig, PresetConfig } from './plugins-docs';

export function generateDocs(schema: TJS.Definition, types: (PluginConfig | PresetConfig)[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const p of types) {
    const subSchema = schema.definitions![p.identifier] as TJS.Definition;
    const apiDocs = generateContentForSchema(subSchema);
    let content = '';

    if (subSchema.description) {
      content += `${subSchema.description}\n\n`;
    }

    if (apiDocs) {
      content += `### Config API Reference\n\n${apiDocs}`;
    }

    result[p.name] = content;
  }

  return result;
}

function generateContentForSchema(schema: TJS.Definition): string {
  return Object.keys(schema.properties || {})
    .map(propName => {
      const prop = schema.properties![propName] as TJS.Definition;

      return `<details>
  <summary>${propName}</summary>

  type: \`${printType(prop)}\`
  ${prop.default !== undefined ? `default: \`${prop.default === '' ? '(empty)' : prop.default}\`\n` : ''}
  ${prop.description ? `${prop.description}\n` : ''}
  ${
    (prop as any).exampleMarkdown
      ? ` \n### Usage Examples\n\n${(prop as any).exampleMarkdown.replace(/## /g, '##### ')}\n`
      : ''
  }
</details>`;
    })
    .join('\n');
}

function printType(def: TJS.Definition): string {
  if (def.type) {
    if (def.enum) {
      return `${def.type} (values: ${def.enum.join(', ')})`;
    }

    if (def.type === 'array') {
      return `${printType(def.items as TJS.Definition)}[]`;
    }

    return def.type as string;
  }
  if (def.$ref) {
    return def.$ref.replace('#/definitions/', '');
  }
  if (def.anyOf) {
    return def.anyOf.map(t => printType(t as TJS.Definition)).join(' | ');
  }
  if (def.oneOf) {
    return def.oneOf.map(t => printType(t as TJS.Definition)).join(' | ');
  }
  if (def.allOf) {
    return def.allOf.map(t => printType(t as TJS.Definition)).join(' & ');
  }
  return '';
}
