import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Component.ts', () => {
  it('UserManagerRoleType enum should be exported', () => {
    const fileContent = readFileSync(join(__dirname, '../src/__generated__/Component.ts'), 'utf-8');

    expect(fileContent).toMatch(/export enum UserManagerRoleType/);
  });

  it('UserManagerRoleType should be referenced without any prefix', () => {
    const fileContent = readFileSync(join(__dirname, '../src/__generated__/Component.ts'), 'utf-8');

    expect(fileContent).toMatch(/roleType:\s*UserManagerRoleType;/);
  });
});
