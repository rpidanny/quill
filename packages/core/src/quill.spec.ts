import { Quill } from './quill';
import {
  AllLogLevels,
  LogLevel,
  LogOutputFormat,
  LowerCasedLogLevel,
} from './quill.enum';

const LogLevelsWithColorMapping: Record<LogLevel, string> = {
  TRACE: '\x1b[35mTRACE\x1b[0m',
  DEBUG: '\x1b[36mDEBUG\x1b[0m',
  INFO: '\x1b[32mINFO\x1b[0m',
  WARN: '\x1b[33mWARN\x1b[0m',
  ERROR: '\x1b[31mERROR\x1b[0m',
  FATAL: '\x1b[31mFATAL\x1b[0m',
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

  describe.each([...Object.keys(LogLevel), ...Object.keys(LowerCasedLogLevel)])(
    'log level %s',
    (level) => {
      afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });

      it('should log string with the correct log level', () => {
        const stdOutSpy = jest.spyOn(process.stdout, 'write');

        const logger = new Quill({
          appName,
          level: level as AllLogLevels,
          region,
          environment,
          stage,
        });

        logger[level.toLowerCase() as LowerCasedLogLevel](logMessage);

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
          level: level as AllLogLevels,
          region,
          environment,
          stage,
        });

        logger[level.toLowerCase() as LowerCasedLogLevel]({
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
          level: level as AllLogLevels,
        });

        logger[level.toLowerCase() as LowerCasedLogLevel]({
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
        const logger = new Quill({
          appName,
          hooks,
          level: level as AllLogLevels,
        });

        logger[level.toLowerCase() as LowerCasedLogLevel]('test');

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
          level: level as AllLogLevels,
          region,
          environment,
          stage,
          logOutputFormat: LogOutputFormat.TEXT,
        });

        logger[level.toLowerCase() as LowerCasedLogLevel](logMessage);

        expect(stdOutSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            `[${
              LogLevelsWithColorMapping[level.toUpperCase() as LogLevel]
            }] ${logMessage}`
          )
        );
      });
    }
  );
});
