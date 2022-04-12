import { PromiseQueue, PromiseQueueEmptyError } from '../src'

describe('Basic queue operations', () => {

	test('construct PromiseQueue instances', () => {
		const q1 = new PromiseQueue<number>()
		const q2 = new PromiseQueue<string>()
		const q3 = new PromiseQueue<any>()

		expect(Array.isArray(q1.toArray())).toBe(true)
		expect(Array.isArray(q2.toArray())).toBe(true)
		expect(Array.isArray(q3.toArray())).toBe(true)
	})

	test('simple queuing of timeout', async () => {

		async function timeoutResult(value: string, delay: number) {
			return new Promise((resolve: (val: string) => any) => {
				setTimeout(() => {
					resolve(value)
				}, delay)
			})
		}

		const q = new PromiseQueue<string>()

		q.add(timeoutResult, 'hello', 1000)
		q.add(() => timeoutResult('goodbye', 500))

		expect(q.size()).toBe(2)

		// Should take 1 second to return hello
		let start = Date.now()
		const result = await q.peek()
		expect(Math.abs(Date.now() - start - 1000)).toBeLessThan(10)
		expect(result).toBe('hello')
		expect(q.size()).toBe(2)

		// Should retrieve immediately from cached result
		start = Date.now()
		const sameResult = await q.poll()
		expect(Math.abs(Date.now() - start)).toBeLessThan(10)
		expect(result).toBe(sameResult)

		// The queue size is now shorter
		expect(q.size()).toBe(1)

		// Retrieve goodbye
		expect(await q.remove()).toBe('goodbye')
		expect(Math.abs(Date.now() - start - 500)).toBeLessThan(100)

		expect(q.size()).toBe(0)

		try {
			expect(await q.remove()).toThrowError()
		}
		catch (error) {
			expect(error).toBe(PromiseQueueEmptyError)
		}
	})

	test('async error handling', async () => {

		async function timeoutResult(value?: string, error?: any) {
			return new Promise((resolve: (val: string) => any, reject: (error: any) => any) => {
				setTimeout(() => {
					if (error)
						reject(error)
					else
						resolve(value || 'default')
				}, 100)
			})
		}

		const error = { name: 'MockError', message: 'This is a mock error' }

		// second item in the queue will throw an error
		const q = new PromiseQueue<string>()
		q.add(timeoutResult, 'success')
		q.add(timeoutResult, 'error', error)
		q.add(timeoutResult)


		expect(await q.element()).toBe('success')
		expect(q.size()).toBe(3)
		expect(await q.element()).toBe('success')
		expect(q.size()).toBe(3)
		expect(await q.poll()).toBe('success')
		expect(q.size()).toBe(2)

		// Ensure the next item keeps throwing the error if peek or element are called
		try {
			expect(await q.element()).toThrowError()
		}
		catch (e) {
			expect(e).toBe(error)
		}

		try {
			expect(await q.peek()).toThrowError()
		}
		catch (e) {
			expect(e).toBe(error)
		}

		// Clear the item
		try {
			expect(await q.poll()).toThrowError()
		}
		catch (e) {
			expect(e).toBe(error)
		}

		expect(q.size()).toBe(1)
		expect(await q.element()).toBe('default')
		expect(q.size()).toBe(1)
		expect(await q.poll()).toBe('default')
		expect(q.size()).toBe(0)
		expect(await q.peek()).toBe(null)
	})

	test('Switch between FIFO/FILO', async () => {
		const q = new PromiseQueue<number>()
		const asyncAdd = async (...nums: Array<number>) => nums.reduce((a, b) => (a + b), 0)
		q.add(asyncAdd)
		q.add(asyncAdd, 1)
		q.add(asyncAdd, 2, 3)
		q.add(asyncAdd, 4, 5, 6)
		q.add(asyncAdd, 7, 8, 9, 10)

		q.useFILO()
		expect(await q.peek()).toBe(34)
		expect(await q.remove()).toBe(34)
		expect(await q.remove()).toBe(15)
		q.useFIFO()
		expect(await q.peek()).toBe(0)
		expect(await q.remove()).toBe(0)
		expect(await q.remove()).toBe(1)
		q.clear()
		expect(q.size()).toBe(0)

		try {
			expect(await q.element()).toThrowError()
		}
		catch (e) {
			expect(e).toBe(PromiseQueueEmptyError)
		}
	})

	test('batching', async () => {
		const q = new PromiseQueue<string>()

		async function timeoutResult(value: string, delay: number) {
			return new Promise((resolve: (val: string) => any) => {
				setTimeout(() => {
					resolve(value)
				}, delay)
			})
		}

		q.add(timeoutResult, 'Tom', 1000)
		q.add(timeoutResult, 'Jane', 1000)
		q.add(timeoutResult, 'Zack', 1500)
		q.add(timeoutResult, 'Alice', 2000)
		q.add(timeoutResult, 'Bob', 500)

		const start = Date.now()
		const elapsedTime = (offset?: number) => Math.abs(Date.now() - start - (offset || 0))

		expect(await q.poll()).toBe('Tom')
		expect(elapsedTime(1000)).toBeLessThan(10)
		expect(await q.poll()).toBe('Jane')
		expect(elapsedTime(2000)).toBeLessThan(15)
		expect(await q.batch(2)).toStrictEqual(['Zack', 'Alice'])
		expect(elapsedTime(4000)).toBeLessThan(20)
		q.useFILO()
		expect(await q.batch(2)).toStrictEqual(['Bob'])
		expect(elapsedTime(4500)).toBeLessThan(25)
		expect(q.size()).toBe(0)
		expect(await q.batch(2)).toStrictEqual([])
	})

	test('async iterator', async () => {
		const q = new PromiseQueue<number>()
		const asyncProduct = async (...nums: Array<number>) => nums.reduce((a, b) => (a * b), 1)

		for (let i = 1 ; i <= 10 ; i++) {
			q.add(asyncProduct, i, i + 1, i + 2)
		}
		expect(q.size()).toBe(10)

		let product = 6, next = 4, results = 0
		for await (const result of q) {
			expect(result).toBe(product)
			product = product * next / (next - 3)
			next++
			results++
		}
		expect(q.size()).toBe(0)
		expect(next).toBe(14)
		expect(results).toBe(10)
		expect(product).toBe(11 * 12 * 13)

		for (let i = 1 ; i <= 10 ; i++) {
			q.add(asyncProduct, i, i + 1)
		}
		expect(q.size()).toBe(10)
		results = 0
		for await (const result of q) {
			results++
			if (result > 50) {
				expect(result).toBe(7 * 8)
				break
			}
		}

		expect(results).toBe(7)

	})
})
