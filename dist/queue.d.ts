/**
 * @class 	Queue
 * @desc 	Zero-dependency FIFO/FILO queue implementation for TypeScript.
 * @author 	Keshav Saharia (keshav@keshav.is)
 */
export declare class Queue<T> {
    /**
     * The underlying array that stores items in this queue.
     */
    private _array;
    /**
     * The queue acts as a FIFO (first-in first-out) queue by default, but can also be configured
     * to act as a FILO (first-in last-out) stack.
     */
    private _fifo;
    /**
     * @constructor
     * @desc 		Constructs this Queue instance, optionally with the given initial elements.
     */
    constructor(initial?: Array<T>);
    /**
     * @func 		add
     * @desc 		Adds a new item or array of items to this queue
     * @param 		{T | Array<T>} item - item to add
     */
    add(item: T | Array<T>): this;
    /**
     * @func 		clear
     * @desc 		Removes all the elements of this queue.
     * @returns 	{Queue} reference to this instance after the items have been cleared
     */
    clear(): this;
    /**
     * @func 		element
     * @desc 		Retrieves, but does not remove, the head of this queue.
     * @returns 	{T} head item
     * @throws 		{QueueEmptyError}
     */
    element(): T;
    /**
     * @func 		peek
     * @desc 		Retrieves, but does not remove, the head of this queue, or returns `null` if this queue is empty.
     * @returns 	{T | null} head item if it exists, otherwise null
     */
    peek(): T | null;
    /**
     * @func 		remove
     * @desc 		Retrieves and removes the head of this queue.
     * @returns 	{T} head item
     * @throws 		{QueueEmptyError} if the queue is empty
     */
    remove(): T;
    /**
     * @func 		poll
     * @desc 		Retrieves and removes the head of this queue, or returns `null` if this queue is empty.
     * @returns 	{T | null} head item if it exists, otherwise null
     */
    poll(): T | null;
    /**
     * @func 		size
     * @desc 		Returns the size of this queue
     */
    size(): number;
    /**
     * @func 		toArray
     * @desc
     */
    toArray(): Array<T>;
    /**
     * @iterator
     */
    [Symbol.iterator](): Iterator<T>;
    /**
     * @func 	toString
     * @desc 	For debugging and testing, prints an unambiguous representation of the queue ordering
     */
    toString(element?: (el: T) => string): string;
    /**
     * @func 	nextIndex
     * @desc 	Returns the index to retrieve the next front element from
     * @returns {number} index to start splicing from
     */
    private nextIndex;
    /**
     * @func 	useFIFO
     * @desc 	Sets the ordering of this queue to traditional first-in first-out.
     * @returns {Queue} this instance
     */
    useFIFO(): Queue<T>;
    /**
     * @func 	useFILO
     * @desc 	Sets the ordering of this queue to that of a stack (first-in last-out).
     * @returns {Queue} this instance
     */
    useFILO(): Queue<T>;
}
/**
 * Empty queue error, exported mainly for testing purposes.
 */
export declare const QueueEmptyError: {
    name: string;
    message: string;
};
