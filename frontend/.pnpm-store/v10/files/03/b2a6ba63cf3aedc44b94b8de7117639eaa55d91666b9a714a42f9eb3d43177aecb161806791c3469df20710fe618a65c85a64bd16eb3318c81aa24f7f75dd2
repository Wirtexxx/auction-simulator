import { Computed, Signal, SignalOptions } from '@tma.js/signals';
export type SignalsTuple<T> = [Signal<T>, Computed<T>];
/**
 * Creates a new signal with the initial value.
 * @param initialValue - the initial value.
 * @param options - additional options.
 */
export declare function createSignal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T>;
/**
 * Creates a new signal without the initial value.
 * @param initialValue - the initial value.
 * @param options - additional options.
 */
export declare function createSignal<T>(initialValue?: T, options?: SignalOptions<T | undefined>): Signal<T | undefined>;
/**
 * Creates a signal, which wil be automatically updated if some of its dependant signals were
 * modified.
 * @param fn - computation function.
 * @param options - additional functions.
 */
export declare function createComputed<T>(fn: (prev?: T) => T, options?: SignalOptions<T>): Computed<T>;
/**
 * Resets all signals states.
 */
export declare function resetSignals(): void;
/**
 * @returns A tuple, containing a manual and computed signals. The computed signal is based on
 * the manual one.
 * @param initialValue - the initial value.
 * @param options - additional options.
 */
export declare function createSignalsTuple<T>(initialValue: T, options?: SignalOptions<T>): SignalsTuple<T>;
/**
 * @returns A tuple, containing a manual and computed signals. The computed signal is based on
 * the manual one.
 * @param initialValue - an initial value.
 * @param options - additional options.
 */
export declare function createSignalsTuple<T>(initialValue?: T, options?: SignalOptions<T | undefined>): SignalsTuple<T | undefined>;
