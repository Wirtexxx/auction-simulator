import { CancelledError, TimeoutError } from './errors.js';
type Maybe<T> = T | undefined | null;
export interface BetterPromiseOptions {
    /**
     * Should the `abortSignal` passed to the executor be aborted if the promise was rejected.
     *
     * By default, as long as there is no point to perform any operations at the moment of rejection,
     * the signal will be aborted.
     * @default true
     */
    abortOnReject?: boolean;
    /**
     * Should the `abortSignal` passed to the executor be aborted if the promise was fulfilled.
     *
     * By default, as long as there is no point to perform any operations at the moment of resolve,
     * the signal will be aborted.
     * @default true
     */
    abortOnResolve?: boolean;
    /**
     * Signal to abort the execution.
     */
    abortSignal?: AbortSignal;
    /**
     * Execution timeout. After the timeout was reached, the promise will be aborted
     * with the `TimeoutError` error.
     */
    timeout?: number;
}
export type BetterPromiseResolveFn<T> = undefined extends T ? (value?: T) => void : (value: T) => void;
export type BetterPromiseRejectFn = (reason?: any) => void;
export type BetterPromiseRejectReason = TimeoutError | CancelledError | unknown;
interface EventMap<Result> {
    resolved: Result;
    rejected: BetterPromiseRejectReason;
    finalized: {
        kind: 'resolved';
        result: Result;
    } | {
        kind: 'rejected';
        reason: BetterPromiseRejectReason;
    };
}
export interface BetterPromiseExecutorContext<Result> {
    /**
     * Abort signal. Will be aborted if the promise was rejected.
     */
    readonly abortSignal: AbortSignal;
    /**
     * @returns True if the promise was rejected.
     */
    get isRejected(): boolean;
    /**
     * @returns True if the promise was resolved.
     */
    get isResolved(): boolean;
    /**
     * Adds a new event listener to the specified event.
     * @param event - event to listen to.
     * @param listener - a corresponding callback function to call.
     */
    on<E extends keyof EventMap<Result>>(event: E, listener: (ev: EventMap<Result>[E]) => void): VoidFunction;
    /**
     * @returns Promise resolve result if it was resolved.
     */
    get result(): Result | undefined;
    /**
     * @returns Promise rejection reason if the promise was rejected.
     */
    get rejectReason(): BetterPromiseRejectReason | undefined;
    /**
     * Will throw a rejection reason if the promise was rejected.
     */
    throwIfRejected: () => void;
}
export type BetterPromiseExecutorFn<T> = (res: BetterPromiseResolveFn<T>, rej: BetterPromiseRejectFn, context: BetterPromiseExecutorContext<T>) => any;
export type BetterPromiseOnFulfilledFn<TResult1, TResult2> = (value: TResult1) => TResult2 | PromiseLike<TResult2>;
export type BetterPromiseOnRejectedFn<T> = (value: any) => T | PromiseLike<T>;
export declare class BetterPromise<Result> extends Promise<Result> {
    static fn<Result>(fn: (context: BetterPromiseExecutorContext<Result>) => (Result | PromiseLike<Result>), options?: BetterPromiseOptions): BetterPromise<Awaited<Result>>;
    /**
     * @see Promise.resolve
     */
    static resolve(): BetterPromise<void>;
    /**
     * @see Promise.resolve
     */
    static resolve<T>(value: T | PromiseLike<T>): BetterPromise<Awaited<T>>;
    /**
     * @see Promise.reject
     */
    static reject(reason?: unknown): BetterPromise<never>;
    constructor(options?: BetterPromiseOptions);
    constructor(executor?: BetterPromiseExecutorFn<Result>, options?: BetterPromiseOptions);
    /**
     * Rejects the promise with the `CancelledError` error.
     */
    cancel(): void;
    /**
     * @see Promise.catch
     */
    catch<CatchResult = never>(onRejected?: Maybe<BetterPromiseOnRejectedFn<CatchResult>>): BetterPromise<Result | CatchResult>;
    /**
     * @see Promise.finally
     */
    finally(onFinally?: Maybe<() => void>): BetterPromise<Result>;
    /**
     * Rejects the initially created promise.
     *
     * This method not only aborts the signal passed to the executor, but also rejects the
     * promise itself calling all chained listeners.
     *
     * The reason passed to the method is being passed as-is to the executor's context.
     */
    reject: BetterPromiseRejectFn;
    /**
     * Resolves the promise.
     */
    resolve: BetterPromiseResolveFn<Result>;
    /**
     * @see Promise.then
     */
    then<A = Result, B = never>(onFulfilled?: Maybe<BetterPromiseOnFulfilledFn<Result, A>>, onRejected?: Maybe<BetterPromiseOnRejectedFn<B>>): BetterPromise<A | B>;
}
export {};
