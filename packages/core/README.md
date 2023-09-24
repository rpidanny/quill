# Core

Core Quill Node.js logger.

## Installation

To use Quill, simply install the package from NPM using the following command:

```sh
npm i --save @rpidanny/quill
```

## Usage

```ts
import Quill from '@rpidanny/quill';
const logger = new Quill({ service: 'my-awesome-service' });

logger.info('hey there');
```

### Hooks

Quill can be effortlessly customized with an array of log transformation functions, also known as `hooks`. Take a look at the following example, where every log message receives an enchanting prefix.

```ts
import Quill from '@rpidanny/quill';

const logger = new Quill({
  service: 'my-awesome-service',
  hooks: [
    (log) => ({
      ...log,
      message: `PREFIX: ${log.message}`,
    }),
  ],
});
```
