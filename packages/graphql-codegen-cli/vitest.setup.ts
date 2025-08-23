import { vi } from 'vitest';

vi.spyOn(process, 'cwd').mockImplementation(() => __dirname);
vi.mock('some-fetch', () => require('./tests/__mocks__/some-fetch.cjs'));
