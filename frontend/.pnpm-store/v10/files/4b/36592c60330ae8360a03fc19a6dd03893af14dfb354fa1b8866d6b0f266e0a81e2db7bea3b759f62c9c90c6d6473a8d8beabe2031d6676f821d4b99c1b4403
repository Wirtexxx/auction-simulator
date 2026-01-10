import { either as E } from 'fp-ts';
import { MaybeAccessor } from '../types.js';
export interface MountableOptions<S, Err> {
    /**
     * A state to use if the `restoreState` function returned falsy value or
     * `isPageReload` returned false.
     */
    initialState: S | (() => E.Either<Err, S>);
    /**
     * @returns True if the current page was reloaded.
     */
    isPageReload: MaybeAccessor<boolean>;
    /**
     * A function to call whenever the component was mounted.
     * @param state - restored state.
     */
    onMounted?: (state: S) => void;
    /**
     * A function to call whenever the component was unmounted.
     */
    onUnmounted?: VoidFunction;
    /**
     * Attempts to restore previously saved component state. This function
     * will only be called if the current page was reloaded.
     */
    restoreState: () => (S | undefined);
}
export declare class Mountable<S extends object, Err = never> {
    constructor({ onMounted, restoreState, initialState, onUnmounted, isPageReload, }: MountableOptions<S, Err>);
    private readonly _isMounted;
    /**
     * Signal indicating if the component is mounted.
     */
    readonly isMounted: import('@tma.js/signals').Computed<boolean>;
    /**
     * Mounts the component restoring its state and calling required side effects.
     */
    readonly mount: () => E.Either<Err, void>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
}
