import { either as E } from 'fp-ts';
import { UnknownEnvError } from '../errors.js';
import { MethodNameWithOptionalParams, MethodNameWithoutParams, MethodNameWithRequiredParams, MethodParams } from './types/index.js';
export type PostEventError = UnknownEnvError;
export type PostEventFn = typeof postEvent;
export type PostEventFpFn = typeof postEventFp;
/**
 * @see postEventFp
 */
export declare function postEvent<Method extends MethodNameWithRequiredParams>(method: Method, params: MethodParams<Method>): void;
/**
 * @see postEventFp
 */
export declare function postEvent(method: MethodNameWithoutParams): void;
/**
 * @see postEventFp
 */
export declare function postEvent<Method extends MethodNameWithOptionalParams>(method: Method, params?: MethodParams<Method>): void;
/**
 * Calls Mini Apps methods requiring parameters.
 * @param method - method name.
 * @param params - options along with params.
 */
export declare function postEventFp<Method extends MethodNameWithRequiredParams>(method: Method, params: MethodParams<Method>): E.Either<PostEventError, void>;
/**
 * Calls Mini Apps methods accepting no parameters at all.
 * @param method - method name.
 */
export declare function postEventFp(method: MethodNameWithoutParams): E.Either<PostEventError, void>;
/**
 * Calls Mini Apps methods accepting optional parameters.
 * @param method - method name.
 * @param params - options along with params.
 */
export declare function postEventFp<Method extends MethodNameWithOptionalParams>(method: Method, params?: MethodParams<Method>): E.Either<PostEventError, void>;
