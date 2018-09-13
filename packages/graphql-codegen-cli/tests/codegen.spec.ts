import { getLogger } from 'graphql-codegen-core';
import { cliError } from '../src/codegen';

describe('cliError', () => {
  let spyLogger: jest.SpyInstance;
  let spyProcessExit: jest.SpyInstance;

  beforeEach(() => {
    spyLogger = jest.spyOn(getLogger(), 'error');
    spyLogger.mockImplementation();
    spyProcessExit = jest.spyOn(process, 'exit');
    spyProcessExit.mockImplementation();
  });

  afterEach(() => {
    spyLogger.mockRestore();
    spyProcessExit.mockRestore();
  });

  it('should handle an Error', () => {
    const msg = 'used as error';

    cliError(new Error(msg));

    expect(spyLogger).toBeCalledWith(msg);
    expect(spyProcessExit).toBeCalledWith(1);
  });

  it('should handle string', () => {
    const msg = 'used as string';

    cliError(msg);

    expect(spyLogger).toBeCalledWith(msg);
    expect(spyProcessExit).toBeCalledWith(1);
  });

  it('should handle an object', () => {
    const obj = {
      foo: 1
    };

    cliError(obj);

    expect(spyLogger).toBeCalledWith(JSON.stringify(obj));
    expect(spyProcessExit).toBeCalledWith(1);
  });
});
