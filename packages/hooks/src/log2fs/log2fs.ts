import { FullLog, Hook } from '@rpidanny/quill';
import { appendFileSync, existsSync } from 'fs';
import moment = require('moment');

export function log2fs(logPath: string): Hook {
  if (!existsSync(logPath))
    throw new Error(`Log path ${logPath} does not exist.`);

  return (log: FullLog) => {
    const date = moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss.SS Z');
    const logText = `[${date}] [${log.level}] ${log.message}\n`;

    appendFileSync(logPath, `${logText}`);
    return log;
  };
}
