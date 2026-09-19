import { exec } from 'child_process';
import { platform } from 'os';
import { lifecycleHooks } from '../src/hooks.js';

vi.mock('child_process', () => ({
  exec: vi.fn((cmd: string, _options: unknown, callback: (...args: any[]) => void) => {
    callback(null, '', '');
  }),
}));

const mockExec = vi.mocked(exec);

afterEach(() => {
  vi.clearAllMocks();
});

describe.skipIf(platform() !== 'win32')('lifecycleHooks - win32', () => {
  it('does not wrap a path argument in POSIX shell quoting', async () => {
    // cmd.exe (Windows' default shell) doesn't strip POSIX single quotes, so a quoted
    // path is passed to the hook script with the quote characters still attached,
    // and it fails to find the file at that (now-wrong) path.
    await lifecycleHooks({ afterAllFileWrite: ['prettier --write'] }).afterAllFileWrite([
      'D:\\a\\graphql-code-generator\\graphql-code-generator\\dev-test\\general\\modules\\types.ts',
    ]);

    expect(mockExec).toHaveBeenCalledTimes(1);
    expect(mockExec.mock.calls[0][0]).toMatchInlineSnapshot(
      `"prettier --write D:\\a\\graphql-code-generator\\graphql-code-generator\\dev-test\\general\\modules\\types.ts"`,
    );
  });

  it('wraps a path argument containing a space in double quotes', async () => {
    // cmd.exe's own quoting convention is double quotes, not POSIX single quotes.
    await lifecycleHooks({ afterAllFileWrite: ['prettier --write'] }).afterAllFileWrite([
      'C:\\Program Files\\dev-test\\general\\modules\\types.ts',
    ]);

    expect(mockExec).toHaveBeenCalledTimes(1);
    expect(mockExec.mock.calls[0][0]).toMatchInlineSnapshot(
      `"prettier --write "C:\\Program Files\\dev-test\\general\\modules\\types.ts""`,
    );
  });
});

describe.skipIf(platform() === 'win32')('lifecycleHooks - posix', () => {
  it('wraps a path argument containing special characters in POSIX shell quoting', async () => {
    await lifecycleHooks({ afterAllFileWrite: ['prettier --write'] }).afterAllFileWrite([
      '/home/user/graphql code generator/dev-test/general/modules/types.ts',
    ]);

    expect(mockExec).toHaveBeenCalledTimes(1);
    expect(mockExec.mock.calls[0][0]).toMatchInlineSnapshot(
      `"prettier --write '/home/user/graphql code generator/dev-test/general/modules/types.ts'"`,
    );
  });
});
