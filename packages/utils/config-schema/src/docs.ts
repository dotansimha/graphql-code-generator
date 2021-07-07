import * as TJS from 'typescript-json-schema';
import { PluginConfig, PresetConfig } from './plugins';

export function generateDocs(schema: TJS.Definition, types: (PluginConfig | PresetConfig)[]): Record<string, string> {
  const result = {};

  for (const p of types) {
    const subSchema = schema.definitions[p.identifier] as TJS.Definition;
    const apiDocs = generateContentForSchema(subSchema);
    let content = '';

    if (subSchema.description && subSchema.description !== '') {
      content += `${subSchema.description}\n\n`;
    }

    content += ``;
    content += `## Installation\n\n

<img alt="${p.name} plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/${p.name}?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>\n\n
    
:::shell Using \`yarn\`
    yarn add -D @graphql-codegen/${p.name}
:::\n\n`;

    if (apiDocs) {
      content += `## API Reference\n\n${apiDocs}`;
    }

    result[p.name] = content;
  }

  return result;
}

function generateContentForSchema(schema: TJS.Definition): string {
  return Object.keys(schema.properties || {})
    .map(propName => {
      const prop = schema.properties[propName] as TJS.Definition;

      return `### \`${propName}\`

type: \`${printType(prop)}\`
${typeof prop.default !== 'undefined' ? `default: \`${prop.default}\`\n` : ''}
${prop.description ? `${prop.description}\n` : ''}${
        (prop as any).exampleMarkdown
          ? `\n#### Usage Examples\n\n${(prop as any).exampleMarkdown.replace(/## /g, '##### ')}`
          : ''
      }`;
    })
    .join('\n\n');
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
  } else if (def.$ref) {
    return def.$ref.replace('#/definitions/', '');
  } else if (def.anyOf) {
    return def.anyOf.map(t => printType(t as TJS.Definition)).join(' | ');
  } else if (def.oneOf) {
    return def.oneOf.map(t => printType(t as TJS.Definition)).join(' | ');
  } else if (def.allOf) {
    return def.allOf.map(t => printType(t as TJS.Definition)).join(' & ');
  } else {
    return '';
  }
}
