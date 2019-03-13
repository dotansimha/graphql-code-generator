import { writeFileSync } from 'fs';
export { fileExists } from './file-exists';

export function writeSync(filepath: string, content: string) {
  writeFileSync(filepath, content);
}
