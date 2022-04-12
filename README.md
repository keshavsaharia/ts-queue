# TypeScript Queue

`ts-queue` is a robust implementation of a [queue data structure](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) in NodeJS/TypeScript.

**Features:**

- all standard queue operations with familiar data structure naming (`poll`, `peek`, `add`, `element`, `remove`, `size`, etc)
- zero external dependencies
- comprehensive unit testing with full coverage, and extensive commenting/documentation
- support for useful applications like queueing asynchronous functions
- queue functions that return `Promise` objects (useful for scraping and API testing/automation)
- separate `PromiseQueue` implementation that supports `async`/`await`, async iteration with `for await`, and efficient caching for asynchronous `peek`/`poll` operations
- suitable for mission-critical applications, especially where [npm supply chain security](https://en.wikipedia.org/wiki/Peacenotwar) is of concern

## Queue

A `Queue<T>` instance is a traditional queue that manages an underlying array of items conforming to the type `T`.

```typescript
import { Queue } from 'ts-queue'

const queue = new Queue<number>()
queue.add(5)
queue.add([1, 3])

// Standard peek/poll methods for retrieving the front item
queue.peek()   // 5
queue.poll()   // 5

// Same as poll, but throws an error if empty
queue.remove() // 1

// Same as peek, but throws an error if empty
queue.element() // 3

// Add items and switch directions any time
queue.add(10)
queue.add(20)
queue.add(30)
queue.useFILO()
queue.poll()   // 30
queue.useFIFO()
queue.poll()   // 10
queue.poll()   // 20
```

### Iterating

Provides syntactic sugar for sequentially iterating through elements of the queue.

```typescript
// Poll with a while loop
while (queue.size() > 0) {
	const item = queue.poll()
	// ... handle front item
}

// Poll with an iterator
for (const item of queue) {
	// ... handle item
}
```

## PromiseQueue

A `PromiseQueue<T>` instance is a separate queue implementation for queueing `Promise` objects and asynchronous functions
that produce `Promise` objects.

```typescript
import { PromiseQueue } from 'ts-queue'

// Queue any function that produces a `Promise` object
const makeRequest: Request = async (id: string): Promise<object> => {
	// ... return API response
}

const queue = new PromiseQueue<object>()

// Add some requests (subsequent parameters are passed to `makeRequest`)
queue.add(makeRequest, 'first-id')
queue.add(makeRequest, 'second-id')
queue.add(makeRequest, 'third-id')
queue.add(makeRequest, 'fourth-id')

// Get first two API responses in sequential order
const first = await queue.poll()
const second = await queue.poll()

// Get second two API responses in parallel
const [ third, fourth ] = await queue.batch(2)
```

### Iterating

Provides syntactic sugar for sequentially iterating through elements of the queue and handling asynchronous delay.

```typescript
// Poll with a while loop
while (queue.size() > 0) {
	const item = await queue.poll()
	// ... handle front item
}

// Poll with an async iterator
for await (const item of queue) {
	// ... handle item
}
```


## Testing

Tests are in the [/test](./test) directory. Each implementation has a corresponding `.test.ts` file that uses [Jest](https://jestjs.io/)
to describe unit tests and handle validations.

```
jest
npm run test
```

You can also generate a code coverage report with `jest --coverage` or `npm run coverage`.

```
jest --coverage
npm run coverage
```

Coverage reports are generated into the `coverage` directory. Further open-source development is expected to maintain 100% coverage and
be meaningfully verified by unit testing.

### License

MIT
