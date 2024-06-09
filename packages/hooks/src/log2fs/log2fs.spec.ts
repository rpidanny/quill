import { FullLog, LogLevel } from '@rpidanny/quill';
import { appendFileSync, existsSync } from 'fs';

import { log2fs } from './log2fs';

jest.mock('fs', () => ({
  appendFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

describe('log2fs', () => {
  const logPath = '/path/to/log.txt';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2010-10-21').getTime());

    (existsSync as jest.Mock).mockReturnValue(true);
    (appendFileSync as jest.Mock).mockClear();
  });

  it('should append log to file', () => {
    const date = new Date();

    const log: FullLog = {
      message: 'Test log',
      timestamp: date.getTime(),
      dateString: date.toISOString(),
      level: LogLevel.INFO,
      hostname: 'test-host',
    };

    log2fs(logPath)(log);

    expect(existsSync).toHaveBeenCalledWith(logPath);
    expect(appendFileSync).toHaveBeenCalledWith(
      logPath,
      expect.stringContaining(`] [INFO] Test log\n`)
    );
  });

  it('should throw an error if logPath does not exist', () => {
    (existsSync as jest.Mock).mockReturnValue(false);

    expect(() => log2fs(logPath)({} as FullLog)).toThrowError(
      `Log path ${logPath} does not exist.`
    );
    expect(existsSync).toHaveBeenCalledWith(logPath);
    expect(appendFileSync).not.toHaveBeenCalled();
  });
});
