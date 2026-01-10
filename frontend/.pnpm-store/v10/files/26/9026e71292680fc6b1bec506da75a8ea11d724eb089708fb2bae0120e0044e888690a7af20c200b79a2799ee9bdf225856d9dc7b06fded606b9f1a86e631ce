# `better-promises`

[code-badge]: https://img.shields.io/badge/source-black?logo=github

[link]: https://github.com/heyqbnk/better-promises/tree/master

[npm-link]: https://npmjs.com/package/better-promises

[npm-badge]: https://img.shields.io/npm/v/better-promises?logo=npm

[size-badge]: https://img.shields.io/bundlephobia/minzip/better-promises

[![NPM][npm-badge]][npm-link]
![Size][size-badge]
[![code-badge]][link]

JavaScript's `Promise` enhanced, flexible version you may find useful in your project.

## Installation

```bash
# yarn
yarn add better-promises

# pnpm
pnpm i better-promises

# npm
npm i better-promises
```

## Creating

The `BetterPromise` class has several ways of creating its instance.

- **Using no arguments at all**

```ts
import { BetterPromise } from 'better-promises';

const promise = new BetterPromise();
```

- **Using options only**

```ts
const controller = new AbortController();
const promise = new BetterPromise({
  abortSignal: controller.signal,
  timeout: 3000
});
```

- **Using the promise executor**. In this case the executor will receive an additional
  argument representing the execution context (you will learn about it later).

```ts
const promise = new BetterPromise((resolve, reject, context) => {
  // ..
});
```

- **Using both executor and options**.

```ts
const controller = new AbortController();
const promise = new BetterPromise((resolve, reject, context) => {
  // ..
}, {
  abortSignal: controller.signal,
  timeout: 3000,
});
```

When the promise was resolved or rejected, the executor receives a corresponding event:

```ts
new BetterPromise((resolve, reject, context) => {
  context.on('rejected', reason => {
    // ...
  });
  context.on('resolved', result => {
    // ...
  });
  context.on('finalized', result => {
    // ...
  });
});
```

Now, let's learn more about its executor and execution context.

## Execution Context

**Executor** is a function, passed to the promise constructor. **Execution context** is an additional
argument passed to the executor. It contains useful data that executor may use.

### `readonly abortSignal: unknown`

Abort signal created by the promise. You can use this in order to know when the promise was either rejected or
resolved. You will likely need this value in order to pass it to some other abortable operations.

```typescript
new BetterPromise((resolve, reject, { abortSignal }) => {
  abortSignal.onabort = () => {
    console.log('Promise was finalized:', abortSignal.reason);
  };
});
```

### `get isRejected(): boolean`

Returns `true` if the promise was rejected.

```ts
new BetterPromise((resolve, reject, context) => {
  console.log(context.isRejected); // false
  reject();
  console.log(context.isRejected); // true
});
```

### `get isResolved(): boolean`

Returns `true` if the promise was resolved.

```ts
new BetterPromise((resolve, reject, context) => {
  console.log(context.isResolved); // false
  resolve();
  console.log(context.isResoled); // true
});
```

### `on(event, listener): VoidFunction`

Adds an event listener to one of the following events:

- `resolved` - the payload will be a resolved value;
- `rejected` - the payload will be a rejection reason;
- `finalized` - the payload will be one of the following objects:
  - `{ kind: 'resolved', result: T }`
  - `{ kind: 'rejected', reason: TimeoutError | CancelledError | unknown }`

```typescript
new BetterPromise((resolve, reject, context) => {
  context.on('resolved', result => {
    console.log(result);
    // Output: 123
  });
  resolve(123);
});

new BetterPromise((resolve, reject, context) => {
  context.on('rejected', reason => {
    console.log(reason);
    // Output: Error('test')
  });
  resolve(new Error('test'))
});

new BetterPromise((resolve, reject, context) => {
  context.on('finalized', value => {
    console.log(value);
    // Output: { kind: 'resolved', value: 123 }
  });
  resolve(123)
});
```

Note that if the promise is already in fulfilled state, listeners bound to the `finalized` and `resolved` events will
be called instantaneously. We can say the same about a rejected promise and trying to listen to the `rejected` event.

```typescript
new BetterPromise((resolve, reject, context) => {
  resolve(123);

  // As long as the promise is already resolved at this moment, 
  // the listener will be called instantenously, so you wouldn't
  // wait for it endlessly.
  context.on('resolved', result => {
    // ...
  });
});
```

### `get result(): T | undefined`

Returns promise resolve result.

```typescript
new BetterPromise((resolve, reject, context) => {
  console.log(context.result); // undefined
  resolve(123);
  console.log(context.result); // 123
});
```

### `get rejectReason(): TimeoutError | CancelledError | unknown | undefined`

Returns promise rejection reason.

```typescript
new BetterPromise((resolve, reject, context) => {
  console.log(context.rejectReason); // undefined
  reject(new Error('test'));
  console.log(context.rejectReason); // Error('test')
});
```

### `throwIfRejected(): void`

Will throw an error if the promise is currently reject. The thrown error will be equal to the rejection reason.

```ts
const controller = new AbortController();
controller.abort(new Error('Hey ho!'));

new BetterPromise((resolve, reject, context) => {
  context.throwIfRejected();
}, {
  abortSignal: controller.signal,
})
  .catch(e => {
    console.log(e);
    // Output: Error('Hey ho!')
  });
```

## Options

### `abortSignal?: AbortSignal`

An abort signal to let the promise know, it should abort the execution.

```ts
const controller = new AbortController();
setTimeout(() => {
  controller.abort(new Error('Oops!'));
}, 1000);

const promise = new BetterPromise({ abortSignal: controller.signal })
  .catch(e => {
    console.log(e);
    // Output: Error('Oops!')
  });
```

### `abortOnReject?: boolean = true`

Should the `abortSignal` passed to the executor be aborted if the promise was rejected.

By default, as long as there is no point to perform any operations at the moment of rejection,
the signal will be aborted.

To prevent the signal from being aborted, use the `false` value.

```typescript
new BetterPromise((resolve, reject, context) => {
  context.abortSignal.onabort = () => {
    // This function will be called.
  };
  reject(new Error('test'));
});

new BetterPromise((resolve, reject, context) => {
  context.abortSignal.onabort = () => {
    // This function will NOT be called.
  };
  reject(new Error('test'));
}, { abortOnReject: false });
```

### `abortOnResolve?: boolean = true`

Should the `abortSignal` passed to the executor be aborted if the promise was fulfilled.

By default, as long as there is no point to perform any operations at the moment of resolve, the signal will be aborted.

To prevent the signal from being aborted, use the `false` value.

```typescript
new BetterPromise((resolve, reject, context) => {
  context.abortSignal.onabort = () => {
    // This function will be called.
  };
  resolve(123)
});

new BetterPromise((resolve, reject, context) => {
  context.abortSignal.onabort = () => {
    // This function will NOT be called.
  };
  resolve(123)
}, { abortOnResolve: false });
```

To check if the abort reason represents a promise resolve result, use the `isResolved` function:

```typescript
new BetterPromise((resolve, reject, context) => {
  context.abortSignal.onabort = () => {
    if (isResolved(context.abortSignal.reason)) {
      console.log(context.abortSignal.reason.value);
      // Output: 123
    }
  };
  resolve(123)
});
```

### `timeout?: number`

Timeout in milliseconds after which the promise will be aborted with the `TimeoutError` error.

```ts
const promise = new BetterPromise({ timeout: 1000 })
  .catch(e => {
    if (TimeoutError.is(e)) {
      console.log(e);
      // Output: TimeoutError('Timed out: 1000ms')
    }
  });
```

## Methods

In addition to standard promise methods (`then`, `catch`, and `finally`), `BetterPromise`
introduces three new methods: `abort`, `reject` and `cancel`. It also provides a static
method `fn`.

### `fn`

The `fn` static method executes a function and resolves its result.

The executed function receives the same execution context as when using the default way of
using `BetterPromise` via constructor.

The method optionally accepts options passed to the `BetterPromise` constructor.

```ts
const controller = new AbortController();
const promise = BetterPromise.fn(context => 'Resolved!', {
  abortSignal: controller.signal,
  timeout: 3000,
});

promise.then(console.log); // Output: 'Resolved!'

const promise2 = BetterPromise.fn(() => {
  throw new Error('Nah :(');
});
promise2.catch(console.error); // Output: Error('Nah :(')

const promise3 = BetterPromise.fn(async () => {
  const r = await fetch('...');
  return r.json();
});
// promise3 resolves with the fetched JSON body
```

### `reject`

The `reject` method rejects the initially created promise with a given reason. It is important to
note that `reject` applies to the original promise, regardless of any chained promises. So, calling
this method, only the initially created promise will be rejected to follow the expected flow.

The expected flow is the flow when rejection was performed in the promise executor (the function,
passed to the promise constructor), and then all chained callbacks (add via `catch(func)`) called.

Here is the example:

```ts
const promise = new BetterPromise();
const promise2 = promise.catch(e => {
  console.log('I got it!');
});

// Here calling promise.reject() and promise2.reject()
// will have the same effect. We will see the log "I got it!"
```

A bit more real-world example:

```ts
const promise = new BetterPromise((res, rej) => {
  return fetch('...').then(res, rej);
})
  .then(r => r.json())
  .catch(e => {
    console.error('Something went wrong', e);
  });

// Imagine, that we want to reject the promise for some reason
// and stop the execution. Calling the "reject" method we expect
// the "rej" argument in the executor to be called, and then
// call the "catch" method callback.

promise.reject(new Error('Stop it! Get some help!'));
// Output: 'Something went wrong', Error('Stop it! Get some help!')
```

### `cancel`

This method rejects the promise with `CancelledError`.

```ts
new BetterPromise()
  .catch(e => {
    if (CancelledError.is(e)) {
      console.log('Canceled');
    }
  })
  .cancel();
// Output: Canceled.
```

### `resolve`

This method resolves the promise with the specified result.

```ts
const promise = new ManualPromise();
promise.then(console.log);
// Output: 'Done!'

promise.resolve('Done!');
```
