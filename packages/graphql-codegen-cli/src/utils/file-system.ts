import { promises, unlink as fsUnlink } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const { writeFile: fsWriteFile, readFile: fsReadFile, mkdir } = promises;

export function writeFile(filepath: string, content: string) {
  return fsWriteFile(filepath, content);
}

export function readFile(filepath: string) {
  return fsReadFile(filepath, 'utf-8');
}

export function unlinkFile(filePath: string, cb?: (err?: Error) => any): void {
  fsUnlink(filePath, cb);
}

export function mkdirp(filePath: string) {
  return mkdir(filePath, { recursive: true });
}

export function getTempDir() {
  return join(tmpdir(), `graphql-codegen-cli`);
}
