import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'www'
    }
  ],
  globalScript: 'src/global/app.ts'
};
