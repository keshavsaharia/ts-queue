"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueEmptyError = exports.Queue = void 0;
/**
 * @class 	Queue
 * @desc 	Zero-dependency FIFO/FILO queue implementation for TypeScript.
 * @author 	Keshav Saharia (keshav@keshav.is)
 */
class Queue {
    /**
     * @constructor
     * @desc 		Constructs this Queue instance, optionally with the given initial elements.
     */
    constructor(initial) {
        /**
         * The queue acts as a FIFO (first-in first-out) queue by default, but can also be configured
         * to act as a FILO (first-in last-out) stack.
         */
        this._fifo = true;
        this._array = initial || [];
    }
    /**
     * @func 		add
     * @desc 		Adds a new item or array of items to this queue
     * @param 		{T | Array<T>} item - item to add
     */
    add(item) {
        if (Array.isArray(item))
            this._array.push.apply(this._array, item);
        else
            this._array.push(item);
        return this;
    }
    /**
     * @func 		clear
     * @desc 		Removes all the elements of this queue.
     * @returns 	{Queue} reference to this instance after the items have been cleared
     */
    clear() {
        this._array = [];
        return this;
    }
    /**
     * @func 		element
     * @desc 		Retrieves, but does not remove, the head of this queue.
     * @returns 	{T} head item
     * @throws 		{QueueEmptyError}
     */
    element() {
        if (this._array.length == 0)
            throw exports.QueueEmptyError;
        return this._array[this.nextIndex()];
    }
    /**
     * @func 		peek
     * @desc 		Retrieves, but does not remove, the head of this queue, or returns `null` if this queue is empty.
     * @returns 	{T | null} head item if it exists, otherwise null
     */
    peek() {
        // If there is any item in this queue, return the item at the front (0 for FIFO, length - 1 for FILO)
        return this._array.length > 0 ? this._array[this.nextIndex()] : null;
    }
    /**
     * @func 		remove
     * @desc 		Retrieves and removes the head of this queue.
     * @returns 	{T} head item
     * @throws 		{QueueEmptyError} if the queue is empty
     */
    remove() {
        if (this._array.length == 0)
            throw exports.QueueEmptyError;
        return this._array.splice(this.nextIndex(), 1)[0];
    }
    /**
     * @func 		poll
     * @desc 		Retrieves and removes the head of this queue, or returns `null` if this queue is empty.
     * @returns 	{T | null} head item if it exists, otherwise null
     */
    poll() {
        // If there is a front item in the array
        return this._array.length > 0 ?
            // Splice the array at the next index (0 for a FIFO queue, array length - 1 for a FILO queue), or
            // return null if there is no front item
            this._array.splice(this.nextIndex(), 1)[0] : null;
    }
    /**
     * @func 		size
     * @desc 		Returns the size of this queue
     */
    size() {
        return this._array.length;
    }
    /**
     * @func 		toArray
     * @desc
     */
    toArray() {
        return this._array;
    }
    /**
     * @iterator
     */
    [Symbol.iterator]() {
        const queue = this;
        return {
            next() {
                const done = queue.size() == 0;
                const value = queue.poll();
                return {
                    // Return the previous hit before the increment, or undefined if done
                    value: value,
                    // Return the done flag if there are no more results in the query
                    done
                };
            },
            // If `break` or `return` is called early in the loop
            return() {
                const value = queue.peek();
                return {
                    value: value,
                    done: true
                };
            }
        };
    }
    /**
     * @func 	toString
     * @desc 	For debugging and testing, prints an unambiguous representation of the queue ordering
     */
    toString(element) {
        if (!element)
            element = (el) => ('' + el);
        return this._array.map((e) => element(e)).join(this._fifo ? ' <- ' : ' -> ');
    }
    /**
     * @func 	nextIndex
     * @desc 	Returns the index to retrieve the next front element from
     * @returns {number} index to start splicing from
     */
    nextIndex() {
        return this._fifo ? 0 : this._array.length - 1;
    }
    /**
     * @func 	useFIFO
     * @desc 	Sets the ordering of this queue to traditional first-in first-out.
     * @returns {Queue} this instance
     */
    useFIFO() {
        this._fifo = true;
        return this;
    }
    /**
     * @func 	useFILO
     * @desc 	Sets the ordering of this queue to that of a stack (first-in last-out).
     * @returns {Queue} this instance
     */
    useFILO() {
        this._fifo = false;
        return this;
    }
}
exports.Queue = Queue;
/**
 * Empty queue error, exported mainly for testing purposes.
 */
exports.QueueEmptyError = {
    name: 'QueueEmpty',
    message: 'The queue is empty.'
};
