import { If, IsNever } from '@tma.js/toolkit';
import { BetterPromise } from 'better-promises';
import { taskEither as TE } from 'fp-ts';
import { EventName, EventPayload } from '../events/types/index.js';
import { MethodNameWithOptionalParams, MethodNameWithRequiredParams, MethodNameWithoutParams, MethodParams } from '../methods/types/index.js';
import { RequestCaptureEventFn, RequestCaptureEventsFn, RequestCaptureFn, RequestError, RequestFpOptions, RequestOptions, RequestCaptureFnEventsPayload } from './request.js';
type AnyEventName = EventName | EventName[];
export type Request2Error = RequestError;
export type Request2CaptureEventsFn<E extends EventName[]> = RequestCaptureEventsFn<E>;
export type Request2CaptureEventFn<E extends EventName> = RequestCaptureEventFn<E>;
export type Request2CaptureFn<E extends AnyEventName> = RequestCaptureFn<E>;
export type Request2Options<E extends AnyEventName> = RequestOptions<E>;
export type Request2FpOptions<E extends AnyEventName> = RequestFpOptions<E>;
export type Request2CaptureFnEventsPayload<E extends EventName[]> = RequestCaptureFnEventsPayload<E>;
export type Request2Result<E extends AnyEventName> = E extends (infer U extends EventName)[] ? U extends infer K extends EventName ? {
    event: K;
    payload: If<IsNever<EventPayload<K>>, undefined, EventPayload<K>>;
} : never : E extends EventName ? If<IsNever<EventPayload<E>>, undefined, EventPayload<E>> : never;
export type Request2Fn = typeof request2;
export type Request2FpFn = typeof request2Fp;
/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 */
export declare function request2Fp<M extends MethodNameWithRequiredParams, E extends AnyEventName, AbortError = never>(method: M, eventOrEvents: E, options: Request2FpOptions<E> & {
    params: MethodParams<M>;
}): TE.TaskEither<Request2Error | AbortError, Request2Result<E>>;
/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 */
export declare function request2Fp<M extends MethodNameWithOptionalParams, E extends AnyEventName, AbortError = never>(method: M, eventOrEvents: E, options?: Request2FpOptions<E> & {
    params?: MethodParams<M>;
}): TE.TaskEither<Request2Error | AbortError, Request2Result<E>>;
/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 */
export declare function request2Fp<M extends MethodNameWithoutParams, E extends AnyEventName, AbortError = never>(method: M, eventOrEvents: E, options?: Request2FpOptions<E>): TE.TaskEither<Request2Error | AbortError, Request2Result<E>>;
/**
 * @see request2Fp
 */
export declare function request2<M extends MethodNameWithRequiredParams, E extends AnyEventName>(method: M, eventOrEvents: E, options: Request2Options<E> & {
    params: MethodParams<M>;
}): BetterPromise<Request2Result<E>>;
/**
 * @see request2Fp
 */
export declare function request2<M extends MethodNameWithOptionalParams, E extends AnyEventName>(method: M, eventOrEvents: E, options?: Request2Options<E> & {
    params?: MethodParams<M>;
}): BetterPromise<Request2Result<E>>;
/**
 * @see request2Fp
 */
export declare function request2<M extends MethodNameWithoutParams, E extends AnyEventName>(method: M, eventOrEvents: E, options?: Request2Options<E>): BetterPromise<Request2Result<E>>;
export {};
