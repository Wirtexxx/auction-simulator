/**
 * Defines a property, that is a functions compose. Trying to set a value in this property
 * will lead to adding it to a function's pool. The property value will always be equal to a
 * function, calling all collected functions in the pool.
 *
 * Returned function performs a cleanup. It does one of the following:
 * 1. Removes the property if no functions were to the pool added other than the initial one.
 * 2. Sets the value equal to the first added function to the pool after the initial one if
 * the only one additional function was added at all. In other words, if the pool length is equal
 * to 2, the second item will be selected as the property value.
 * 3. Leaves the value equal to a function calling all pool functions, but removes the initially
 * added one.
 * @param obj - object.
 * @param propertyName - object property.
 * @param initialFn - an initial function to set.
 */
export declare function defineFnComposer(obj: any, propertyName: string, initialFn: (...args: any) => any): void;
/**
 * Wires the specified property in the object preventing it from being overwritten. Instead, it
 * enhances the previous value by merging the current one with the passed one.
 * @param obj - object.
 * @param prop - object property to rewire.
 */
export declare function defineMergeableProperty(obj: any, prop: string): void;
/**
 * Defines an enumerable and configurable property with a getter and setter.
 * @param obj - object.
 * @param prop - object property name.
 * @param get - getter to use.
 * @param set - setter to use.
 */
export declare function defineProxiedProperty(obj: any, prop: string, get: () => unknown, set: (v: any) => void): void;
/**
 * Defines an enumerable, configurable and writable property with the initial value.
 * @param obj - object.
 * @param prop - object property name.
 * @param value - value to set.
 */
export declare function defineStaticProperty(obj: any, prop: string, value: any): void;
