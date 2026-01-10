import { Version } from '@tma.js/types';
import { PostEventFn } from './postEvent.js';
import { MethodName, MethodNameWithVersionedParams, MethodVersionedParams } from './types/index.js';
export type OnUnsupportedFn = (data: {
    version: Version;
} & ({
    method: MethodName;
} | {
    [M in MethodNameWithVersionedParams]: {
        method: M;
        param: MethodVersionedParams<M>;
    };
}[MethodNameWithVersionedParams])) => void;
export type CreatePostEventMode = 'strict' | 'non-strict';
/**
 * Creates a function that checks if the specified method and parameters are supported.
 *
 * If the method or parameters are unsupported, the `onUnsupported` function will be called.
 *
 * If `strict` or `non-strict` value was passed as the second argument, the function
 * will create its own `onUnsupported` function with behavior depending on the value passed.
 *
 * - Passing `strict` will make the function to throw a `MethodParameterUnsupportedError`
 * or a `MethodUnsupportedError` error.
 * - Passing `non-strict` will just warn you about something being unsupported.
 *
 * @param version - Telegram Mini Apps version.
 * @param onUnsupportedOrMode - function or strict mode. Default: `strict`
 */
export declare function createPostEvent(version: Version, onUnsupportedOrMode?: OnUnsupportedFn | CreatePostEventMode): PostEventFn;
