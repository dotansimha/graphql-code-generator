import os from 'os';
import { join, parse, relative, resolve } from 'path';
import makeDir from 'make-dir';
import * as rimraf from 'rimraf';

const fs = await vi.importActual<typeof import('fs')>('fs');

export class TempDir {
  dir: string;

  constructor() {
    const tempDir = fs.realpathSync(os.tmpdir());
    const relativeParent = relative(process.cwd(), 'codegen');

    // Each temp directory will be unique to the test file.
    // This ensures that temp files/dirs won't cause side effects for other tests.
    this.dir = resolve(tempDir, 'codegen', `${relativeParent}-dir`);

    makeDir.sync(this.dir);
  }

  createFile(file: string, contents: string): void {
    const filePath = join(this.dir, file);
    const fileDir = parse(filePath).dir;

    makeDir.sync(fileDir);

    fs.writeFileSync(filePath, `${contents}\n`);
  }

  clean() {
    const cleanPattern = join(this.dir, '**/*');
    rimraf.sync(cleanPattern);
  }

  deleteTempDir() {
    rimraf.sync(this.dir);
  }
}
