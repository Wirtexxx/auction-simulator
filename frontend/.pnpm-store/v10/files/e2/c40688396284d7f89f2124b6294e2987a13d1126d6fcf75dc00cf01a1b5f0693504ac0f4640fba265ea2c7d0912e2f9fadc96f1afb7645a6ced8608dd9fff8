import { either as E } from 'fp-ts';
export type DecodeBase64UrlError = DOMException;
/**
 * Decodes a base-64-url ASCII string.
 * @param value - the value to decode.
 * @see Learn more about base64url:
 * https://herongyang.com/Encoding/Base64URL-Encoding-Algorithm.html
 * @see Source:
 * https://developer.mozilla.org/ru/docs/Glossary/Base64#solution_1_–_escaping_the_string_before_encoding_it
 */
export declare function decodeBase64UrlFp(value: string): E.Either<DecodeBase64UrlError, string>;
/**
 * @see decodeBase64UrlFp
 */
export declare const decodeBase64Url: ((value: string) => string) & {};
/**
 * Creates a base-64-url encoded ASCII string from the passed value.
 * @param value - the value to encode.
 * @see Learn more about base64url:
 * https://herongyang.com/Encoding/Base64URL-Encoding-Algorithm.html
 * @see Source:
 * https://developer.mozilla.org/ru/docs/Glossary/Base64#solution_1_–_escaping_the_string_before_encoding_it
 */
export declare function encodeBase64Url(value: string): string;
