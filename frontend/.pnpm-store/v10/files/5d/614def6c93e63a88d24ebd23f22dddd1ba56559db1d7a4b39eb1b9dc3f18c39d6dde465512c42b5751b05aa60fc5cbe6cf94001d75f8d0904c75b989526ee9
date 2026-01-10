export type SnakeToCamelCase<S extends string> = S extends `${infer Head}_${infer Tail}` ? `${Head}${Capitalize<SnakeToCamelCase<Tail>>}` : S;
/**
 * Converts string value from snake case to camel case.
 * @param value - value to convert.
 */
export declare function snakeToCamel<T extends string>(value: T): SnakeToCamelCase<T>;
