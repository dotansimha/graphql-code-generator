/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as TJS from 'typescript-json-schema';
import { PluginConfig, PresetConfig } from './plugins-docs';

export function generateDocs(schema: TJS.Definition, types: (PluginConfig | PresetConfig)[]): Record<string, string> {
  return Object.fromEntries(
    types.map(p => {
      const subSchema = schema.definitions![p.identifier] as TJS.Definition;
      const apiDocs = generateContentForSchema(subSchema);
      let content = '';

      if (subSchema.description) {
        content += `${subSchema.description}\n\n`;
      }

      if (apiDocs) {
        content += `## Config API Reference\n\n${apiDocs}`;
      }

      return [p.name, content];
    })
  );
}

function generateContentForSchema(schema: TJS.Definition): string {
  return Object.entries(schema.properties || {})
    .map(([propName, prop]) => {
      if (typeof prop === 'boolean') {
        throw new Error(`Prop "${propName}" should not be a "boolean"`);
      }

      return `### \`${propName}\`

  type: \`${printType(prop)}\`
  ${prop.default !== undefined ? `default: \`${prop.default === '' ? '(empty)' : prop.default}\`\n` : ''}
  ${prop.description ? `${prop.description}\n` : ''}
  ${
    (prop as any).exampleMarkdown
      ? ` \n#### Usage Examples\n\n${(prop as any).exampleMarkdown.replace(/## /g, '##### ')}\n`
      : ''
  }`;
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
