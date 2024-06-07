import { hostname } from 'os';

import { FullLog, Hook, Log, LogMetadata, QuillOptions } from './interfaces';
import { AllLogLevels, LogLevel, LogOutputFormat } from './quill.enum';

export class Quill {
  private readonly hooks: Hook[];
  private readonly service?: string;
  private readonly appName?: string;
  private readonly componentName?: string;
  private readonly stage?: string;
  private readonly environment?: string;
  private readonly region?: string;
  private readonly level: LogLevel;
  private readonly logOutputFormat: LogOutputFormat;

  private readonly logLevels: { [key in LogLevel]: number } = {
    TRACE: 10,
    DEBUG: 20,
    INFO: 30,
    WARN: 40,
    ERROR: 50,
    FATAL: 60,
  };

  constructor({
    service,
    appName,
    componentName,
    region,
    stage,
    environment,
    level = LogLevel.INFO,
    hooks = [],
    logOutputFormat = LogOutputFormat.JSON,
  }: QuillOptions = {}) {
    this.hooks = hooks;
    this.service = service;
    this.appName = appName;
    this.componentName = componentName;
    this.region = region;
    this.stage = stage;
    this.environment = environment;
    this.level = this.getLogLevel(level);
    this.logOutputFormat = logOutputFormat;
  }

  trace(message: Log | string) {
    this.log(LogLevel.TRACE, message);
  }

  debug(message: Log | string) {
    this.log(LogLevel.DEBUG, message);
  }

  info(message: Log | string) {
    this.log(LogLevel.INFO, message);
  }

  warn(message: Log | string) {
    this.log(LogLevel.WARN, message);
  }

  error(message: Log | string) {
    this.log(LogLevel.ERROR, message);
  }

  fatal(message: Log | string) {
    this.log(LogLevel.FATAL, message);
  }

  private log(level: LogLevel, log: Log | string) {
    if (!this.isEnabled(level)) return;

    const { message, details, err, correlationId }: Log =
      typeof log === 'string' ? { message: log } : log;

    let fullLog: FullLog = {
      ...this.getMetadata(level),
      message,
      details,
      correlationId,
    };

    if (err != null) {
      fullLog.err = this.serializeError(err);
    }

    for (const hook of this.hooks) {
      fullLog = hook(fullLog);
    }

    this.write(fullLog);
  }

  private getLogLevel(level: AllLogLevels): LogLevel {
    return level.toUpperCase() as LogLevel;
  }

  private isEnabled(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.level];
  }

  private write(fullLog: FullLog) {
    if (this.logOutputFormat === LogOutputFormat.TEXT) {
      const date = new Date(fullLog.timestamp).toISOString();
      const colouredLevel = this.getColorForLogLevel(fullLog.level as LogLevel);
      const logText = `[${date}] [${colouredLevel}] ${fullLog.message}\n`;
      process.stdout.write(logText);
    } else if (this.logOutputFormat === LogOutputFormat.JSON) {
      process.stdout.write(`${JSON.stringify(fullLog)}\n`);
    }
  }

  private getMetadata(level: LogLevel): LogMetadata {
    const now = new Date();

    return {
      service: this.service,
      appName: this.appName,
      componentName: this.componentName,
      region: this.region,
      stage: this.stage,
      environment: this.environment,
      timestamp: now.getTime(),
      dateString: now.toISOString(),
      hostname: hostname(),
      level,
    };
  }

  private serializeError(err: Error): Error {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }

  private getColorForLogLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.TRACE:
        return '\x1b[35mTRACE\x1b[0m'; // Magenta color for TRACE
      case LogLevel.DEBUG:
        return '\x1b[36mDEBUG\x1b[0m'; // Cyan color for DEBUG
      case LogLevel.INFO:
        return '\x1b[32mINFO\x1b[0m'; // Green color for INFO
      case LogLevel.WARN:
        return '\x1b[33mWARN\x1b[0m'; // Yellow color for WARN
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return `\x1b[31m${level}\x1b[0m`; // Red color for ERROR / FATAL
      default:
        return level; // Return the log level as is if it's not recognized
    }
  }
}
