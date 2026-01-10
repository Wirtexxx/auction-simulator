export interface ComponentStorage<T> {
    get: () => T | undefined;
    set: (value: T) => void;
}
/**
 * Creates a new sessionStorage-based component storage.
 * @param key - session storage key to use.
 */
export declare function createComponentSessionStorage<T>(key: string): ComponentStorage<T>;
