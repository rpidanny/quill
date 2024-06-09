# Log2FS

**Log2FS** is a simple quill hook that enables you to log your application's activity directly to the file system. This hook is designed to work seamlessly with the [@rpidanny/quill](https://github.com/rpidanny/quill) logging library.

## Usage

```typescript
import { Quill, LogLevel } from '@rpidanny/quill';
import { log2fs } from 'log2fs';

// Specify the path where you want to store the logs
const logPath = '/var/log/crispr.log';
// Make sure the provided log path exists before using this hook, otherwise, it will throw an error.

// Initialize Quill with the hook
const logger = new Quill({
  service: 'crispr-service',
  hooks: [log2fs(logPath)],
  logLevel: LogLevel.INFO,
});

// Now log some activity
logger.info('Application started');
// This will log the activity to the specified file path
```

## Performance Consideration

This hook is primarily suitable for applications where latency isn't a concern, as it utilizes synchronous file system writes (`fs.appendFileSync`). For high-performance applications, consider alternatives.
