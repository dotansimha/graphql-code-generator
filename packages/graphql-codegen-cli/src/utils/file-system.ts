import { writeFileSync, statSync, readFileSync, unlink } from 'fs';

export function writeSync(filepath: string, content: string) {
  return writeFileSync(filepath, content);
}

export function readSync(filepath: string) {
  return readFileSync(filepath, 'utf-8');
}

export function fileExists(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

export function unlinkFile(filePath: string, cb?: (err?: Error) => any): void {
  unlink(filePath, cb);
}
