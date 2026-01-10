import { SnakeToCamelCase } from './snakeToCamel.js';
export type ConvertSnakeKeysToCamelCase<T> = {
    [K in keyof T as SnakeToCamelCase<string & K>]: T[K];
};
/**
 * Converts object keys from snake to camel case.
 * @param value - value to convert.
 */
export declare function snakeToCamelObjKeys<T extends object>(value: T): ConvertSnakeKeysToCamelCase<T>;
