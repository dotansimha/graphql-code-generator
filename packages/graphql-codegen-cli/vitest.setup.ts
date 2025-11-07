import { vi } from 'vitest';

process.env.NO_COLOR = '1'; // When running listr2 tests in generate-and-save.spec.ts, do not add colors to avoid failure in CI as different OS may treat colours differently
vi.spyOn(process, 'cwd').mockImplementation(() => __dirname);
vi.mock('some-fetch', () => require('./tests/__mocks__/some-fetch.cjs'));
