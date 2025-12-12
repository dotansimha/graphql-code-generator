import { readFileSync } from 'fs';
import type { PackageInfo } from './types';

export const readPackagesInfo = (): Record<string, PackageInfo> => {
  return JSON.parse(readFileSync('./packages-info.json', 'utf8'));
};
