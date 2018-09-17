const R_DEF = /\s\@NgModule\([^)]+\)/gm;
const R_MOD = /module\:\s*"([^"]+)"/;

export function operationHasNgModule(operation) {
  return (operation.document as string).includes('@NgModule(');
}

export function removeNgModule(document: string) {
  if (operationHasNgModule({ document })) {
    return document.replace(R_DEF, '');
  }

  return document;
}

export function extractNgModule(operation) {
  const doc: string = operation.document;
  const directives = doc.match(R_DEF);

  if (directives.length > 1) {
    throw new Error(`The NgModule directive used multiple times in '${operation.name}' operation`);
  }

  const [, link] = directives[0].match(R_MOD);
  const [path, module] = link.split('#');

  return {
    path,
    module,
    link
  };
}
