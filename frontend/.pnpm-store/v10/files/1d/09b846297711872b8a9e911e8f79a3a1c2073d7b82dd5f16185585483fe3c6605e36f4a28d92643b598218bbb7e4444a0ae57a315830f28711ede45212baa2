import { Version } from '@tma.js/types';
import { MethodName, MethodNameWithVersionedParams, MethodVersionedParams } from './types/index.js';
/**
 * @returns Version of the specified method parameter release. Returns `null`
 * if passed method or parameter are unknown.
 * @param method - method name
 * @param param - method parameter
 */
export declare function getReleaseVersion<M extends MethodNameWithVersionedParams>(method: M, param: MethodVersionedParams<M>): Version | null;
/**
 * @returns Version of the specified method release. Returns `null`
 * if passed method is unknown.
 * @param method - method name.
 */
export declare function getReleaseVersion(method: MethodName): Version | null;
