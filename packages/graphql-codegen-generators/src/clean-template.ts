export function cleanTemplateComments(template: string): string {
  return template.replace(/\/\*\s*gqlgen\s*(.*?)\s*\*\//g, (all, group) => group ? group : all);
}
