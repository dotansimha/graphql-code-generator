export function debugLog(...args) {
  if (process.env.DEBUG !== undefined) {
    console.log(...args);
  }
}
