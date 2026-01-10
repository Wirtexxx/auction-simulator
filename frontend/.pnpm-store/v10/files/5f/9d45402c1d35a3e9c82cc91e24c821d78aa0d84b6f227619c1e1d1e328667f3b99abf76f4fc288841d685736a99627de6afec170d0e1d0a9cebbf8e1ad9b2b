import { Computed, Signal } from '@tma.js/signals';
export interface StatefulOptions<S> {
    /**
     * The initial state.
     */
    initialState: S;
    /**
     * A function to call whenever the state changes.
     * @param state - updated state.
     */
    onChange: (state: S) => void;
}
export declare class Stateful<S extends object> {
    constructor({ initialState, onChange }: StatefulOptions<S>);
    protected readonly _state: Signal<S>;
    /**
     * The current state.
     */
    readonly state: Computed<S>;
    /**
     * Creates a computed signal based on the state.
     * @param key - a state key to use as a source.
     */
    getter<K extends keyof S>(key: K): Computed<S[K]>;
    /**
     * Updates the state.
     * @param state - updates to apply.
     */
    readonly setState: (state: Partial<S>) => void;
    /**
     * @returns True if specified payload will update the state.
     * @param state
     */
    hasDiff(state: Partial<S>): boolean;
}
