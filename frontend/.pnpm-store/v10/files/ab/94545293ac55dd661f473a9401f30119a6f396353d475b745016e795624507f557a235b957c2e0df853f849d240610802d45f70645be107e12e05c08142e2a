import { BetterPromise } from 'better-promises';
import { taskEither as TE } from 'fp-ts';
import { InvokeCustomMethodFailedError } from '../errors.js';
import { CustomMethodName, CustomMethodParams } from '../methods/types/index.js';
import { Request2Error, Request2FpOptions, Request2Options } from './request2.js';
export type InvokeCustomMethodError = Request2Error | InvokeCustomMethodFailedError;
export type InvokeCustomMethodOptions = Omit<Request2Options<'custom_method_invoked'>, 'capture'>;
export type InvokeCustomMethodFn = typeof invokeCustomMethod;
export type InvokeCustomMethodFpOptions = Omit<Request2FpOptions<'custom_method_invoked'>, 'capture'>;
export type InvokeCustomMethodFpFn = typeof invokeCustomMethodFp;
/**
 * Invokes known custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param requestId - request identifier.
 * @param options - additional options.
 */
export declare function invokeCustomMethodFp<M extends CustomMethodName>(method: M, params: CustomMethodParams<M>, requestId: string, options?: InvokeCustomMethodFpOptions): TE.TaskEither<InvokeCustomMethodError, unknown>;
/**
 * Invokes unknown custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param requestId - request identifier.
 * @param options - additional options.
 */
export declare function invokeCustomMethodFp(method: string, params: object, requestId: string, options?: InvokeCustomMethodFpOptions): TE.TaskEither<Request2Error, unknown>;
/**
 * @see invokeCustomMethodFp
 */
export declare function invokeCustomMethod<M extends CustomMethodName>(method: M, params: CustomMethodParams<M>, requestId: string, options?: InvokeCustomMethodOptions): BetterPromise<unknown>;
/**
 * @see invokeCustomMethodFp
 */
export declare function invokeCustomMethod(method: string, params: object, requestId: string, options?: InvokeCustomMethodOptions): BetterPromise<unknown>;
