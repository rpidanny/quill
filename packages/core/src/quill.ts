import { hostname } from 'os';

import { FullLog, Hook, Log, LogMetadata, QuillOptions } from './interfaces';
import { LogLevel, LogOutputFormat } from './quill.enum';

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
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
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
  }: QuillOptions) {
    this.hooks = hooks;
    this.service = service;
    this.appName = appName;
    this.componentName = componentName;
    this.region = region;
    this.stage = stage;
    this.environment = environment;
    this.level = level;
    this.logOutputFormat = logOutputFormat;
  }

  trace(message: Log | string) {
    this.log(LogLevel.TRACE, message);
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

  debug(message: Log | string) {
    this.log(LogLevel.DEBUG, message);
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

  private isEnabled(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.level];
  }

  private write(fullLog: FullLog) {
    if (this.logOutputFormat === LogOutputFormat.TEXT) {
      const logText = `[${new Date(fullLog.timestamp).toISOString()}] [${
        fullLog.level
      }] ${fullLog.message}\n`;
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
}
