import { either as E, json as J } from 'fp-ts';
import { DecodeBase64UrlError } from './base64-url.js';
/**
 * Creates a safe start parameter value. If the value is not a string, the
 * function applies JSON.stringify to it, so make sure you are not passing an
 * object with circular references.
 *
 * @param value - value to create start parameter from.
 * @see Learn more about start parameter:
 * https://docs.telegram-mini-apps.com/platform/start-parameter
 */
export declare function createStartParamFp(value: unknown): E.Either<Error, string>;
/**
 * @see createStartParamFp
 */
export declare const createStartParam: ((value: unknown) => string) & {};
/**
 * @see decodeStartParamFp
 */
export declare function decodeStartParam<T>(value: string, parse: (value: string) => T): T;
/**
 * @see decodeStartParamFp
 */
export declare function decodeStartParam(value: string, as: 'json'): J.Json;
/**
 * @see decodeStartParamFp
 */
export declare function decodeStartParam(value: string): string;
/**
 * Decodes a start parameter using a custom parser.
 * @param value - a start parameter value.
 * @param parse - a custom value parser.
 */
export declare function decodeStartParamFp<L, R>(value: string, parse: (value: string) => E.Either<L, R>): E.Either<L | DecodeBase64UrlError, R>;
/**
 * Decodes a start parameter assuming that the result is a JSON value.
 * @param value - a start parameter value.
 * @param as - result kind.
 */
export declare function decodeStartParamFp(value: string, as: 'json'): E.Either<SyntaxError | DecodeBase64UrlError, J.Json>;
/**
 * Decodes a start parameter and returns its decoded representation.
 * @param value - a value to decode.
 */
export declare function decodeStartParamFp(value: string): E.Either<DecodeBase64UrlError, string>;
/**
 * @returns True if the passed value is safe to be used to create a start parameter value from it.
 * If true is returned, the value can be safely passed to the `createStartParam` function.
 * @param value - value to check.
 * @see createStartParam
 */
export declare function isSafeToCreateStartParam(value: string): boolean;
