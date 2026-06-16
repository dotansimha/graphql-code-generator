import { vi } from 'vitest';

vi.spyOn(process, 'cwd').mockImplementation(() => __dirname);
