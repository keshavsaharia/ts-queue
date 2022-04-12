declare type Generator<T> = (...args: Array<any>) => Promise<T>;
interface PromiseQueueItem<T> {
    func: Generator<T>;
    args: Array<any>;
}
/**
 * Empty queue error, exported mainly for testing purposes.
 */
export declare const PromiseQueueEmptyError: {
    name: string;
    message: string;
};
/**
 * @class 	PromiseQueue<T>
 * @desc 	Dependency-free implementation of a queue that handles Promise objects. Designed for automating API tasks and
 * 			various sequential asynchronous actions.
 * @author  Keshav Saharia (keshav@keshav.is)
 */
export declare class PromiseQueue<T> {
    private _array;
    private _cached;
    private _result;
    private _error?;
    /**
     * The queue acts as a FIFO (first-in first-out) queue by default, but can also be configured
     * to act as a FILO (first-in last-out) stack.
     */
    private _fifo;
    /**
     * @constructor
     */
    constructor();
    /**
     * @func 	add
     * @desc 	Adds a function that generates a `Promise` object to the queue, along with any arguments that should be passed to
     * 			the function. The practical usage of this is typically for handling a sequence of asynchronous requests - this is
     * 			effectively storing an array of objects that reference a function and optional set of arguments to use for each
     * 			sequential execution.
     * @returns {PromiseQueue<T>} this instance
     */
    add(func: Generator<T>, ...args: Array<any>): PromiseQueue<T>;
    /**
     * @func 	clear
     * @desc 	Empty this queue and clear any cached results.
     * @returns {PromiseQueue<T>} this instance
     */
    clear(): PromiseQueue<T>;
    /**
     * @func 		element
     * @desc 		Retrieves, but does not remove, the head of this queue. If this function is called more than once, it will
     * 				return the cached result from a single execution, and not re-evaluate the stored arguments.
     * @returns 	{Promise<T>} result from evaluating head promise
     * @throws 		{PromiseQueueEmptyError}
     */
    element(): Promise<T>;
    /**
     * @func 		peek
     * @desc 		Retrieves, but does not remove, the head of this queue, or returns `null` if this queue is empty.
     * @returns 	{Promise<T | null>} head result if it exists, otherwise null
     */
    peek(): Promise<T | null>;
    /**
     * @func 		remove
     * @desc 		Retrieves and removes the head of this queue, and evaluates the function.
     */
    remove(): Promise<T>;
    /**
     * @func 		poll
     * @desc
     */
    poll(): Promise<T | null>;
    /**
     * @func 	batch
     * @desc	Evaluate the given number of head elements in parallel. Useful for batching API requests while
     * 			staying below a particular threshold of allowed concurrent requests and/or rate limit.
     */
    batch(size: number): Promise<Array<T>>;
    /**
     * @iterator
     */
    [Symbol.asyncIterator](): AsyncIterator<T>;
    /**
     * @func 	toArray
     * @desc 	Return the underlying data of this queue as an array of functions and their corresponding arguments
     * 			to use when called.
     * @returns {Array<PromiseQueueItem<T>>}
     */
    toArray(): Array<PromiseQueueItem<T>>;
    /**
     * @func 	size
     * @desc 	Returns the number of elements in this queue.
     */
    size(): number;
    /**
     * @func 	nextIndex
     * @desc 	Returns the index to retrieve the next front element from
     * @returns {number} index to start splicing from
     */
    private nextIndex;
    /**
     * @func 	nextBatchIndex
     * @desc 	Returns the index to retrieve the next front element from for a batch of the given size
     * @returns {number} index to start splicing from
     */
    private nextBatchIndex;
    /**
     * @func 	useFIFO
     * @desc 	Sets the ordering of this queue to traditional first-in first-out.
     * @returns {PromiseQueue<T>} this instance
     */
    useFIFO(): PromiseQueue<T>;
    /**
     * @func 	useFILO
     * @desc 	Sets the ordering of this queue to that of a stack (first-in last-out).
     * @returns {PromiseQueue<T>} this instance
     */
    useFILO(): PromiseQueue<T>;
}
export {};
