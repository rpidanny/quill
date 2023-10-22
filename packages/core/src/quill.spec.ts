import { Quill } from './quill';
import {
  AllLogLevels,
  LogLevel,
  LogOutputFormat,
  LowerCasedLogLevel,
} from './quill.enum';

const LogLevelsMapping: Record<AllLogLevels, LowerCasedLogLevel> = {
  TRACE: LowerCasedLogLevel.trace,
  DEBUG: LowerCasedLogLevel.debug,
  INFO: LowerCasedLogLevel.info,
  WARN: LowerCasedLogLevel.warn,
  ERROR: LowerCasedLogLevel.error,
  trace: LowerCasedLogLevel.trace,
  debug: LowerCasedLogLevel.debug,
  info: LowerCasedLogLevel.info,
  warn: LowerCasedLogLevel.warn,
  error: LowerCasedLogLevel.error,
};

const LogLevelsWithColorMapping: Record<AllLogLevels, string> = {
  TRACE: '\x1b[35mTRACE\x1b[0m',
  DEBUG: '\x1b[36mDEBUG\x1b[0m',
  INFO: '\x1b[32mINFO\x1b[0m',
  WARN: '\x1b[33mWARN\x1b[0m',
  ERROR: '\x1b[31mERROR\x1b[0m',
  trace: '\x1b[35mTRACE\x1b[0m',
  debug: '\x1b[36mDEBUG\x1b[0m',
  info: '\x1b[32mINFO\x1b[0m',
  warn: '\x1b[33mWARN\x1b[0m',
  error: '\x1b[31mERROR\x1b[0m',
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
        expect.stringContaining(
          `[${LogLevelsWithColorMapping[level as LogLevel]}] ${logMessage}`
        )
      );
    });
  });
});
