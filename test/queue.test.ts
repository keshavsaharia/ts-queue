import { Queue, QueueEmptyError } from '../src'

describe('Basic queue operations', () => {

	test('construct Queue instances', () => {
		const q1 = new Queue<number>()
		const q2 = new Queue<string>()
		const q3 = new Queue<any>()

		expect(Array.isArray(q1.toArray())).toBe(true)
		expect(Array.isArray(q2.toArray())).toBe(true)
		expect(Array.isArray(q3.toArray())).toBe(true)
	})

	test('test with queue of numbers', () => {
		const q = new Queue<number>()
		expect(q.size()).toBe(0)
		expect(q.peek()).toBe(null)
		expect(q.element.bind(q)).toThrow(QueueEmptyError)

		q.add(1)
		expect(q.size()).toBe(1)
		q.add(100)
		expect(q.size()).toBe(2)

		// Peek and remove
		expect(q.peek()).toBe(1)
		expect(q.size()).toBe(2)
		expect(q.remove()).toBe(1)

		// Poll vs remove
		expect(q.poll()).toBe(100)
		expect(q.poll()).toBe(null)
		expect(q.remove.bind(q)).toThrow(QueueEmptyError)
	})

	test('test with queue of strings', () => {
		const q = new Queue<string>()
		expect(q.size()).toBe(0)
		q.add('Tom')
		q.add('Dick')
		q.add('Harry')
		expect(q.toString()).toBe('Tom <- Dick <- Harry')
		expect(q.size()).toBe(3)

		q.clear()
		expect(q.size()).toBe(0)
	})

	test('test FILO queue', () => {
		const q = new Queue<number>()
		expect(q.size()).toBe(0)
		expect(q.peek()).toBe(null)
		q.add([1, 2, 3, 4, 5])
		expect(q.size()).toBe(5)
		expect(q.peek()).toBe(1)
		q.useFILO()
		expect(q.peek()).toBe(5)
		expect(q.remove()).toBe(5)
		expect(q.remove()).toBe(4)
		q.useFIFO()
		expect(q.element()).toBe(1)
		expect(q.remove()).toBe(1)
		expect(q.remove()).toBe(2)
		expect(q.size()).toBe(1)
		expect(q.toString()).toBe('3')
	})

	test('iterator', () => {
		const q = new Queue<number>()
		const product = (...nums: Array<number>) => nums.reduce((a, b) => (a * b), 1)

		for (let i = 1 ; i <= 10 ; i++) {
			q.add(product(i, i + 1, i + 2))
		}
		expect(q.size()).toBe(10)

		let prod = 6, next = 4, results = 0
		for (const result of q) {
			expect(result).toBe(prod)
			prod = prod * next / (next - 3)
			next++
			results++
		}
		expect(q.size()).toBe(0)
		expect(next).toBe(14)
		expect(results).toBe(10)
		expect(prod).toBe(11 * 12 * 13)

		for (let i = 1 ; i <= 10 ; i++) {
			q.add(product(i, i + 1))
		}
		expect(q.size()).toBe(10)
		results = 0
		for (const result of q) {
			results++
			if (result > 50) {
				expect(result).toBe(7 * 8)
				break
			}
		}

		expect(results).toBe(7)

	})
})
