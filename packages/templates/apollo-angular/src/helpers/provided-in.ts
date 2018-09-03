export function providedIn(options: any): string {
  const config = options.data.root.config || {};

  return config.providedIn ? config.providedIn.ref : `'root'`; // Important to return it with in quotes
}
