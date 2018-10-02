export function eq<T>(this: any, val1: T, val2: T, block: Handlebars.HelperDelegate) {
  if (val1 === val2) {
    return block(this);
  }
}
