import { CamelToSnakeCase } from './camelToSnake.js';
export type ConvertCamelKeysToSnakeCase<T> = {
    [K in keyof T as CamelToSnakeCase<string & K>]: T[K];
};
/**
 * Converts object keys from snake to camel case.
 * @param value - value to convert.
 */
export declare function camelToSnakeObjKeys<T extends object>(value: T): ConvertCamelKeysToSnakeCase<T>;
