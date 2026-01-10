import { RequestError, CustomMethodName, CustomMethodParams, InvokeCustomMethodOptions } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
/**
 * Invokes known custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param options - additional options.
 */
export declare function invokeCustomMethod<M extends CustomMethodName>(method: M, params: CustomMethodParams<M>, options?: InvokeCustomMethodOptions): TE.TaskEither<RequestError, unknown>;
/**
 * Invokes unknown custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param options - additional options.
 */
export declare function invokeCustomMethod(method: string, params: object, options?: InvokeCustomMethodOptions): TE.TaskEither<RequestError, unknown>;
