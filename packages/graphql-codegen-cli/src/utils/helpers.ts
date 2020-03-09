import isglob from 'is-glob';
import { isWebUri } from 'valid-url';

export function isString(val: any): val is string {
  return typeof val === 'string';
}

export function isUrl(val: string): boolean {
  return !!isWebUri(val);
}

export function isGlob(val: string) {
  return isglob(val);
}
