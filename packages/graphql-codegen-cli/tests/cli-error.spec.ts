import { cliError } from '../src/utils/cli-error.js';

describe('cliError', () => {
  let spyProcessExit: ReturnType<typeof vi.spyOn>;
  let spyConsoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spyProcessExit = vi.spyOn(process, 'exit');
    spyProcessExit.mockImplementation(() => {});
    spyConsoleError = vi.spyOn(console, 'error');
    spyConsoleError.mockImplementation(() => {});
  });

  afterEach(() => {
    spyProcessExit.mockRestore();
    spyConsoleError.mockRestore();
  });

  it('should handle an Error', () => {
    const msg = 'used as error';

    cliError(new Error(msg));

    expect(spyProcessExit).toBeCalledWith(1);
  });

  it('should handle string', () => {
    const msg = 'used as string';

    cliError(msg);

    expect(spyProcessExit).toBeCalledWith(1);
  });

  it('should handle an object', () => {
    const obj = {
      foo: 1,
    };

    cliError(obj);

    expect(spyProcessExit).toBeCalledWith(1);
  });
});
