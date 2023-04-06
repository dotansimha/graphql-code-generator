import { promises, unlink as fsUnlink } from 'fs';

const { access: fsAccess, writeFile: fsWriteFile, readFile: fsReadFile, mkdir } = promises;

export function access(...args: Parameters<typeof fsAccess>) {
  return fsAccess(...args);
}

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
