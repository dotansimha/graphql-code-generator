import { statSync } from 'fs';

export const isOutputFolder = (baseOutputDir: string) => statSync(baseOutputDir).isDirectory();
