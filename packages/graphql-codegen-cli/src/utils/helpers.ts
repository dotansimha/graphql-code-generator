export function isURL(str: string): boolean {
  try {
    const url = new URL(str);
    return !!url;
  } catch {
    return false;
  }
}
