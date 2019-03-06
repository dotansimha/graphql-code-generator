import fs from 'fs';
import { fileExists } from './file-exists';

export default {
  writeSync(filepath: string, content: string) {
    fs.writeFileSync(filepath, content);
  },
  fileExists
};
