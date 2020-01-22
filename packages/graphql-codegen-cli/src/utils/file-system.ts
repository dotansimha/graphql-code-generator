import { writeFileSync, statSync, readFileSync } from 'fs';

export function writeSync(filepath: string, content: string) {
  return writeFileSync(filepath, content);
}

export function readSync(filepath: string) {
  return readFileSync(filepath, 'utf-8');
}

export function fileExists(filepath: string): boolean {
  try {
    return statSync(filepath).isFile();
  } catch (err) {
    return false;
  }
}
