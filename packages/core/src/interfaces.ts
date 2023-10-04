import { LogOutputFormat } from './quill.enum';

export type LogLevel = 'DEBUG' | 'ERROR' | 'INFO' | 'TRACE' | 'WARN';
export type Hook = (log: FullLog) => FullLog;

export interface QuillOptions {
  service?: string;
  appName?: string;
  region?: string;
  stage?: string;
  environment?: string;
  componentName?: string;
  level?: LogLevel;
  hooks?: Hook[];
  logOutputFormat?: LogOutputFormat;
}

export interface Log {
  message?: string;
  details?: Record<string, unknown>;
  err?: Error;
  correlationId?: string;
}

export interface LogMetadata {
  level: string;
  timestamp: number;
  dateString: string;
  stage?: string;
  environment?: string;
  hostname: string;
  appName?: string;
  componentName?: string;
  region?: string;
  service?: string;
}

export interface FullLog extends LogMetadata {
  message?: string;
  details?: Record<string, unknown>;
  err?: {
    name: string;
    message: string;
    stack?: string;
  };
  correlationId?: string;
}
