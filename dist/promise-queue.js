"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseQueue = exports.PromiseQueueEmptyError = void 0;
/**
 * Empty queue error, exported mainly for testing purposes.
 */
exports.PromiseQueueEmptyError = {
    name: 'PromiseQueueEmpty',
    message: 'The Promise queue is empty.'
};
/**
 * @class 	PromiseQueue<T>
 * @desc 	Dependency-free implementation of a queue that handles Promise objects. Designed for automating API tasks and
 * 			various sequential asynchronous actions.
 * @author  Keshav Saharia (keshav@keshav.is)
 */
class PromiseQueue {
    /**
     * @constructor
     */
    constructor() {
        // Whether there is a cached result from a Promise execution on peek
        this._cached = false;
        this._result = null;
        this._error = null;
        /**
         * The queue acts as a FIFO (first-in first-out) queue by default, but can also be configured
         * to act as a FILO (first-in last-out) stack.
         */
        this._fifo = true;
        this._array = [];
    }
    /**
     * @func 	add
     * @desc 	Adds a function that generates a `Promise` object to the queue, along with any arguments that should be passed to
     * 			the function. The practical usage of this is typically for handling a sequence of asynchronous requests - this is
     * 			effectively storing an array of objects that reference a function and optional set of arguments to use for each
     * 			sequential execution.
     * @returns {PromiseQueue<T>} this instance
     */
    add(func, ...args) {
        this._array.push({
            func,
            args: (args == null || args.length == 0) ? [] : args
        });
        return this;
    }
    /**
     * @func 	clear
     * @desc 	Empty this queue and clear any cached results.
     * @returns {PromiseQueue<T>} this instance
     */
    clear() {
        this._array = [];
        this._cached = false;
        this._result = null;
        this._error = null;
        return this;
    }
    /**
     * @func 		element
     * @desc 		Retrieves, but does not remove, the head of this queue. If this function is called more than once, it will
     * 				return the cached result from a single execution, and not re-evaluate the stored arguments.
     * @returns 	{Promise<T>} result from evaluating head promise
     * @throws 		{PromiseQueueEmptyError}
     */
    element() {
        return __awaiter(this, void 0, void 0, function* () {
            const el = yield this.peek();
            if (el == null)
                throw exports.PromiseQueueEmptyError;
            return el;
        });
    }
    /**
     * @func 		peek
     * @desc 		Retrieves, but does not remove, the head of this queue, or returns `null` if this queue is empty.
     * @returns 	{Promise<T | null>} head result if it exists, otherwise null
     */
    peek() {
        return __awaiter(this, void 0, void 0, function* () {
            // If the front Promise element has already been evaluated and cached
            if (this._cached) {
                // If the front Promise threw an error, throw the error again
                if (this._error != null)
                    throw this._error;
                // Return the cached result
                return this._result;
            }
            // If there is a front element in the queue
            if (this._array.length > 0) {
                // Get the generator and arguments
                const { func, args } = this._array[this.nextIndex()];
                // Evaluate the generator function with the arguments and cache the result
                try {
                    this._result = yield func(...args);
                    this._error = null;
                    this._cached = true;
                    return this._result;
                }
                // If there is an error, cache the error and throw it again
                catch (error) {
                    this._cached = true;
                    this._result = null;
                    this._error = error;
                    throw error;
                }
            }
            return null;
        });
    }
    /**
     * @func 		remove
     * @desc 		Retrieves and removes the head of this queue, and evaluates the function.
     */
    remove() {
        return __awaiter(this, void 0, void 0, function* () {
            const el = yield this.poll();
            if (el == null)
                throw exports.PromiseQueueEmptyError;
            return el;
        });
    }
    /**
     * @func 		poll
     * @desc
     */
    poll() {
        return __awaiter(this, void 0, void 0, function* () {
            // If the queue is empty
            if (this._array.length == 0)
                return null;
            // Get the next generator
            const { func, args } = this._array.splice(this.nextIndex(), 1)[0];
            // If it was already evaluated, return the awaited result and clear the
            // cached value so the next removed item is properly evaluated (or throw the same error)
            if (this._cached) {
                this._cached = false;
                // If the cached result was an error
                if (this._error != null)
                    throw this._error;
                // Return the cached result
                return this._result;
            }
            // Evaluate the next generator function and return the resulting Promise
            return func(...args);
        });
    }
    /**
     * @func 	batch
     * @desc	Evaluate the given number of head elements in parallel. Useful for batching API requests while
     * 			staying below a particular threshold of allowed concurrent requests and/or rate limit.
     */
    batch(size) {
        return __awaiter(this, void 0, void 0, function* () {
            // If the queue is empty, return an empty batch
            if (this._array.length == 0 || size < 1)
                return [];
            // Get the next generators in this batch
            const next = this._array.splice(this.nextBatchIndex(size), size);
            // Evaluate the next generator functions in parallel with `Promise.all`
            return Promise.all(next.map(({ func, args }) => func(...args)));
        });
    }
    /**
     * @iterator
     */
    [Symbol.asyncIterator]() {
        // Reference to this PromiseQueue instance
        const queue = this;
        // Iterator implementation
        return {
            // Poll and return the next item from this queue
            next() {
                return __awaiter(this, void 0, void 0, function* () {
                    const done = queue.size() == 0;
                    const value = yield queue.poll();
                    return {
                        // Return the previous hit before the increment, or undefined if done
                        value: value,
                        // Return the done flag if there are no more results in the query
                        done
                    };
                });
            },
            // If `break` or `return` is called early in the loop
            return() {
                return __awaiter(this, void 0, void 0, function* () {
                    const value = yield queue.peek();
                    return {
                        value: value,
                        done: true
                    };
                });
            }
        };
    }
    /**
     * @func 	toArray
     * @desc 	Return the underlying data of this queue as an array of functions and their corresponding arguments
     * 			to use when called.
     * @returns {Array<PromiseQueueItem<T>>}
     */
    toArray() {
        return this._array;
    }
    /**
     * @func 	size
     * @desc 	Returns the number of elements in this queue.
     */
    size() {
        return this._array.length;
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
     * @func 	nextBatchIndex
     * @desc 	Returns the index to retrieve the next front element from for a batch of the given size
     * @returns {number} index to start splicing from
     */
    nextBatchIndex(size) {
        return this._fifo ? 0 : Math.max(0, this._array.length - size);
    }
    /**
     * @func 	useFIFO
     * @desc 	Sets the ordering of this queue to traditional first-in first-out.
     * @returns {PromiseQueue<T>} this instance
     */
    useFIFO() {
        this._fifo = true;
        return this;
    }
    /**
     * @func 	useFILO
     * @desc 	Sets the ordering of this queue to that of a stack (first-in last-out).
     * @returns {PromiseQueue<T>} this instance
     */
    useFILO() {
        this._fifo = false;
        return this;
    }
}
exports.PromiseQueue = PromiseQueue;
