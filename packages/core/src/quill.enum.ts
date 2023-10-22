export enum LogOutputFormat {
  JSON = 'JSON',
  TEXT = 'TEXT',
}

export enum LogLevel {
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum LowerCasedLogLevel {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

export type AllLogLevels = LogLevel | LowerCasedLogLevel;
