import { Quill } from './quill';
import { LogLevel, LogOutputFormat } from './quill.enum';

type LowerCaseLogLevels = 'debug' | 'error' | 'info' | 'trace' | 'warn';

const LogLevelsMapping: Record<LogLevel, LowerCaseLogLevels> = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

describe('quill', () => {
  const appName = 'test';
  const stage = 'test';
  const region = 'us-east-1';
  const environment = 't-test';

  const logDetails = { foo: 'bar' };
  const logMessage = 'some-log-message';

  it('should not log if the log level is not enabled', () => {
    const stdOutSpy = jest.spyOn(process.stdout, 'write');

    const logger = new Quill({
      appName,
      level: LogLevel.ERROR,
    });

    logger.info(logMessage);

    expect(stdOutSpy).not.toHaveBeenCalled();
  });

  describe.each(Object.keys(LogLevel))('log level %s', (level) => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('should log string with the correct log level', () => {
      const stdOutSpy = jest.spyOn(process.stdout, 'write');

      const logger = new Quill({
        appName,
        level: level as LogLevel,
        region,
        environment,
        stage,
      });

      logger[LogLevelsMapping[level as LogLevel]](logMessage);

      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"message":"${logMessage}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"region":"${region}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"environment":"${environment}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"stage":"${stage}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"level":"${level.toUpperCase()}"`)
      );
    });

    it('should log log object with the correct log level', () => {
      const stdOutSpy = jest.spyOn(process.stdout, 'write');

      const logger = new Quill({
        appName,
        level: level as LogLevel,
        region,
        environment,
        stage,
      });

      logger[LogLevelsMapping[level as LogLevel]]({
        message: logMessage,
        details: logDetails,
      });

      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"message":"${logMessage}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"details":${JSON.stringify(logDetails)}`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"region":"${region}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"environment":"${environment}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"stage":"${stage}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"level":"${level.toUpperCase()}"`)
      );
    });

    it('should log error with the correct log level', () => {
      const stdOutSpy = jest.spyOn(process.stdout, 'write');

      const err = new Error(logMessage);

      const logger = new Quill({
        appName,
        level: level as LogLevel,
      });

      logger[LogLevelsMapping[level as LogLevel]]({
        err,
      });

      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"message":"${err.message}"`)
      );
      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `"err":${JSON.stringify({
            name: err.name,
            message: err.message,
            stack: err.stack,
          })}`
        )
      );
    });

    it('should call hooks with the correct log level', () => {
      const hooks = [
        jest.fn().mockImplementation((log) => log),
        jest.fn().mockImplementation((log) => log),
      ];
      const logger = new Quill({ appName, hooks, level: level as LogLevel });

      logger[LogLevelsMapping[level as LogLevel]]('test');

      const expectedFullLog = expect.objectContaining({
        level: level.toUpperCase(),
        appName,
        message: 'test',
        timestamp: expect.any(Number),
        dateString: expect.any(String),
        hostname: expect.any(String),
      });

      expect(hooks[0]).toHaveBeenCalledWith(expectedFullLog);
      expect(hooks[1]).toHaveBeenCalledWith(expectedFullLog);
    });

    it('should log string with the correct log level in text format', () => {
      const stdOutSpy = jest.spyOn(process.stdout, 'write');

      const logger = new Quill({
        appName,
        level: level as LogLevel,
        region,
        environment,
        stage,
        logOutputFormat: LogOutputFormat.TEXT,
      });

      logger[LogLevelsMapping[level as LogLevel]](logMessage);

      expect(stdOutSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[${level.toUpperCase()}] ${logMessage}`)
      );
    });
  });
});
