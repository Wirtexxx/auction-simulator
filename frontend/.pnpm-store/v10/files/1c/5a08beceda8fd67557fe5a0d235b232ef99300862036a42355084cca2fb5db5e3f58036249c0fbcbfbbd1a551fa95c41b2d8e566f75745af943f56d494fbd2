import { If, IsNever } from '@tma.js/toolkit';
import { BetterPromise, BetterPromiseOptions, TimeoutError } from 'better-promises';
import { taskEither as TE } from 'fp-ts';
import { EventName, EventPayload } from '../events/types/index.js';
import { PostEventError, PostEventFn, PostEventFpFn } from '../methods/postEvent.js';
import { MethodNameWithOptionalParams, MethodNameWithoutParams, MethodNameWithRequiredParams, MethodParams } from '../methods/types/index.js';
type AnyEventName = EventName | EventName[];
export type RequestError = PostEventError | TimeoutError;
/**
 * @example
 * { event: 'scan_qr_closed' }
 * @example
 * {
 *   event: 'popup_closed',
 *   payload: { button_id: 'ok' }
 * }
 */
export type RequestCaptureFnEventsPayload<E extends EventName[]> = E extends (infer U extends EventName)[] ? {
    [K in U]: If<IsNever<EventPayload<K>>, {
        event: K;
    }, {
        event: K;
        payload: EventPayload<K>;
    }>;
}[U] : never;
export type RequestCaptureEventsFn<E extends EventName[]> = (payload: RequestCaptureFnEventsPayload<E>) => boolean;
export type RequestCaptureEventFn<E extends EventName> = If<IsNever<EventPayload<E>>, () => boolean, (payload: EventPayload<E>) => boolean>;
export type RequestCaptureFn<E extends AnyEventName> = E extends EventName[] ? RequestCaptureEventsFn<E> : E extends EventName ? RequestCaptureEventFn<E> : never;
export interface RequestOptions<E extends AnyEventName> extends Omit<RequestFpOptions<E>, 'postEvent'> {
    /**
     * Custom function to call mini apps methods.
     */
    postEvent?: PostEventFn;
}
export type RequestResult<E extends AnyEventName> = E extends (infer U extends EventName)[] ? U extends infer K extends EventName ? If<IsNever<EventPayload<K>>, undefined, EventPayload<K>> : never : E extends EventName ? If<IsNever<EventPayload<E>>, undefined, EventPayload<E>> : never;
export interface RequestFpOptions<E extends AnyEventName> extends Pick<BetterPromiseOptions, 'abortSignal' | 'timeout'> {
    /**
     * A function that should return true if the event should be captured.
     * The first compatible request will be captured if this property is omitted.
     */
    capture?: RequestCaptureFn<E>;
    /**
     * A custom function to call mini apps methods.
     */
    postEvent?: PostEventFpFn;
}
export type RequestFn = typeof request;
export type RequestFpFn = typeof requestFp;
/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 * @deprecated To be removed in the next major update. Use `request2fp` instead, it provides
 * a proper way of handling multiple events.
 */
export declare function requestFp<M extends MethodNameWithRequiredParams, E extends AnyEventName, AbortError = never>(method: M, eventOrEvents: E, options: RequestFpOptions<E> & {
    params: MethodParams<M>;
}): TE.TaskEither<RequestError | AbortError, RequestResult<E>>;
/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 * @deprecated To be removed in the next major update. Use `request2fp` instead, it provides
 * a proper way of handling multiple events.
 */
export declare function requestFp<M extends MethodNameWithOptionalParams, E extends AnyEventName, AbortError = never>(method: M, eventOrEvents: E, options?: RequestFpOptions<E> & {
    params?: MethodParams<M>;
}): TE.TaskEither<RequestError | AbortError, RequestResult<E>>;
/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 * @deprecated To be removed in the next major update. Use `request2fp` instead, it provides
 * a proper way of handling multiple events.
 */
export declare function requestFp<M extends MethodNameWithoutParams, E extends AnyEventName, AbortError = never>(method: M, eventOrEvents: E, options?: RequestFpOptions<E>): TE.TaskEither<RequestError | AbortError, RequestResult<E>>;
/**
 * @see requestFp
 * @deprecated To be removed in the next major update. Use `request2` instead, it provides
 * a proper way of handling multiple events.
 */
export declare function request<M extends MethodNameWithRequiredParams, E extends AnyEventName>(method: M, eventOrEvents: E, options: RequestOptions<E> & {
    params: MethodParams<M>;
}): BetterPromise<RequestResult<E>>;
/**
 * @see requestFp
 * @deprecated To be removed in the next major update. Use `request2` instead, it provides
 * a proper way of handling multiple events.
 */
export declare function request<M extends MethodNameWithOptionalParams, E extends AnyEventName>(method: M, eventOrEvents: E, options?: RequestOptions<E> & {
    params?: MethodParams<M>;
}): BetterPromise<RequestResult<E>>;
/**
 * @see requestFp
 * @deprecated To be removed in the next major update. Use `request2` instead, it provides
 * a proper way of handling multiple events.
 */
export declare function request<M extends MethodNameWithoutParams, E extends AnyEventName>(method: M, eventOrEvents: E, options?: RequestOptions<E>): BetterPromise<RequestResult<E>>;
export {};
