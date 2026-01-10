import { If, IsNever, IsUndefined, Or } from '@tma.js/toolkit';
import { Handler } from 'mitt';
export type WildcardHandler<E> = Handler<{
    [K in keyof E]: {
        name: K;
        payload: If<Or<IsNever<E[K]>, IsUndefined<E[K]>>, never, E[K]>;
    };
}[keyof E]>;
export interface OnFn<E> {
    /**
     * Adds a new listener for the specified event.
     * @param type - event name.
     * @param handler - event listener.
     * @param once - should this listener be called only once.
     * @returns Function to remove bound event listener.
     */
    <K extends keyof E>(type: K, handler: Handler<E[K]>, once?: boolean): VoidFunction;
    /**
     * Adds a listener to the wildcard event.
     * @param type - event name.
     * @param handler - event listener.
     * @param once - should this listener be called only once.
     * @returns Function to remove bound event listener.
     */
    (type: '*', handler: WildcardHandler<E>, once?: boolean): VoidFunction;
}
export interface OffFn<E> {
    /**
     * Removes a listener from the specified event.
     * @param type - event to listen.
     * @param handler - event listener to remove.
     * @param once - had this listener to be called only once.
     */
    <K extends keyof E>(type: K, handler: Handler<E[K]>, once?: boolean): void;
    /**
     * Removes a listener from the wildcard event.
     * @param type - event to stop listening.
     * @param handler - event listener to remove.
     * @param once - should this listener be called only once.
     */
    (type: '*', handler: WildcardHandler<E>, once?: boolean): void;
}
export interface EmitFn<E> {
    <K extends keyof E>(type: K, event: E[K]): void;
    <K extends keyof E>(type: undefined extends E[K] ? K : never): void;
}
/**
 * Creates a new enhanced event emitter.
 * @param onFirst - a function to call every time when the events map appeared to be empty during
 * the event listener creation.
 * @param onEmpty - a function to call every tume when the events map became empty.
 */
export declare function createEmitter<E extends object>(onFirst: VoidFunction, onEmpty: VoidFunction): {
    on: OnFn<E>;
    off: OffFn<E>;
    emit: EmitFn<E>;
    clear: VoidFunction;
};
