import { Types } from './types';

export function mergeOutputs(content: Types.PluginOutput | Array<Types.PluginOutput>): string {
  let result: Types.ComplexPluginOutput = { content: '', prepend: [], append: [] };

  if (Array.isArray(content)) {
    content.forEach(item => {
      if (typeof item === 'string') {
        result.content += item;
      } else {
        result.content += item.content;
        result.prepend.push(...(item.prepend || []));
        result.append.push(...(item.append || []));
      }
    });
  }

  return [...result.prepend, result.content, ...result.append].join('\n');
}
