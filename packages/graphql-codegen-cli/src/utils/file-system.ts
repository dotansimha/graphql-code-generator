import { writeFile as fsWriteFile, stat as fsStat, readFile as fsReadFile, unlink as fsUnlink } from 'fs-extra';

export function writeFile(filepath: string, content: string) {
  return fsWriteFile(filepath, content);
}

export function readFile(filepath: string) {
  return fsReadFile(filepath, 'utf-8');
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return (await fsStat(filePath)).isFile();
  } catch (err) {
    return false;
  }
}

export function unlinkFile(filePath: string, cb?: (err?: Error) => any): void {
  fsUnlink(filePath, cb);
}
