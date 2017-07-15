import { debugLog } from 'graphql-codegen-core';

export function cleanTemplateComments(template: string): string {
  if (template.match(/\/\*\s*gqlgen/ig)) {
    debugLog(`Found magic comment 'gqlgen' in template...`, template);

    return template
      .replace(/.*({{.*}})/ig, (all, group) => {
        if (all.toLowerCase().includes('gqlgen')) {
          return all;
        }

        return all.replace(/{{/g, '\\{{');
      })
      .replace(/\/\*\s*gqlgen\s*(.*?)\s*\*\//gi, (all, group) => group ? group : all);
  }

  return template;
}
