/**
 * @class 	Queue
 * @desc 	Zero-dependency FIFO/FILO queue implementation for TypeScript.
 * @author 	Keshav Saharia (keshav@keshav.is)
 */
export class Queue<T> {
	/**
	 * The underlying array that stores items in this queue.
	 */
	private _array: Array<T>

	/**
	 * The queue acts as a FIFO (first-in first-out) queue by default, but can also be configured
	 * to act as a FILO (first-in last-out) stack.
	 */
	private _fifo: boolean = true

	/**
	 * @constructor
	 * @desc 		Constructs this Queue instance, optionally with the given initial elements.
	 */
	constructor(initial?: Array<T>) {
		this._array = initial || []
	}

	/**
	 * @func 		add
	 * @desc 		Adds a new item or array of items to this queue
	 * @param 		{T | Array<T>} item - item to add
	 */
	add(item: T | Array<T>) {
		if (Array.isArray(item))
			this._array.push.apply(this._array, item)
		else
			this._array.push(item)
		return this
	}

	/**
	 * @func 		clear
	 * @desc 		Removes all the elements of this queue.
	 * @returns 	{Queue} reference to this instance after the items have been cleared
	 */
	clear() {
		this._array = []
		return this
	}

	/**
	 * @func 		element
	 * @desc 		Retrieves, but does not remove, the head of this queue.
	 * @returns 	{T} head item
	 * @throws 		{QueueEmptyError}
	 */
	element(): T {
		if (this._array.length == 0)
			throw QueueEmptyError

		return this._array[this.nextIndex()]
	}

	/**
	 * @func 		peek
	 * @desc 		Retrieves, but does not remove, the head of this queue, or returns `null` if this queue is empty.
	 * @returns 	{T | null} head item if it exists, otherwise null
	 */
	peek(): T | null {
		// If there is any item in this queue, return the item at the front (0 for FIFO, length - 1 for FILO)
		return this._array.length > 0 ? this._array[this.nextIndex()] : null
	}

	/**
	 * @func 		remove
	 * @desc 		Retrieves and removes the head of this queue.
	 * @returns 	{T} head item
	 * @throws 		{QueueEmptyError} if the queue is empty
	 */
	remove(): T {
		if (this._array.length == 0)
			throw QueueEmptyError

		return this._array.splice(this.nextIndex(), 1)[0]
	}

	/**
	 * @func 		poll
	 * @desc 		Retrieves and removes the head of this queue, or returns `null` if this queue is empty.
	 * @returns 	{T | null} head item if it exists, otherwise null
	 */
	poll(): T | null {
		// If there is a front item in the array
		return this._array.length > 0 ?
			// Splice the array at the next index (0 for a FIFO queue, array length - 1 for a FILO queue), or
			// return null if there is no front item
			this._array.splice(this.nextIndex(), 1)[0] : null
	}

	/**
	 * @func 		size
	 * @desc 		Returns the size of this queue
	 */
	size() {
		return this._array.length
	}

	/**
	 * @func 		toArray
	 * @desc
	 */
	toArray(): Array<T> {
		return this._array
	}

	/**
	 * @iterator
	 */
	[Symbol.iterator](): Iterator<T> {
		const queue = this
		return {
			next(): IteratorResult<T> {
				const done = queue.size() == 0
				const value = queue.poll()
				return {
					// Return the previous hit before the increment, or undefined if done
					value: value!,
					// Return the done flag if there are no more results in the query
					done
				}
			},
			// If `break` or `return` is called early in the loop
			return() {
				const value = queue.peek()
				return {
					value: value!,
					done: true
				}
			}
		}
	}

	/**
	 * @func 	toString
	 * @desc 	For debugging and testing, prints an unambiguous representation of the queue ordering
	 */
	toString(element?: (el: T) => string): string {
		if (! element)
			element = (el) => ('' + el)
		return this._array.map((e) => element!(e)).join(this._fifo ? ' <- ' : ' -> ')
	}

	/**
	 * @func 	nextIndex
	 * @desc 	Returns the index to retrieve the next front element from
	 * @returns {number} index to start splicing from
	 */
	private nextIndex(): number {
		return this._fifo ? 0 : this._array.length - 1
	}

	/**
	 * @func 	useFIFO
	 * @desc 	Sets the ordering of this queue to traditional first-in first-out.
     * @returns {Queue} this instance
	 */
	useFIFO(): Queue<T> {
		this._fifo = true
		return this
	}

	/**
	 * @func 	useFILO
	 * @desc 	Sets the ordering of this queue to that of a stack (first-in last-out).
     * @returns {Queue} this instance
	 */
	useFILO(): Queue<T> {
		this._fifo = false
		return this
	}
}

/**
 * Empty queue error, exported mainly for testing purposes.
 */
export const QueueEmptyError = {
	name: 'QueueEmpty',
	message: 'The queue is empty.'
}
