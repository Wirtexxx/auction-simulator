import { taskEither as TE } from 'fp-ts';
import { AsyncOptions, MaybeAccessor } from '../types.js';
export interface AsyncMountableOptions<S, E> {
    /**
     * A function to retrieve the initial state.
     * @param options - additional options.
     */
    initialState: (options?: AsyncOptions) => TE.TaskEither<E, S>;
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
export declare class AsyncMountable<S extends object, E> {
    constructor({ initialState, onMounted, restoreState, onUnmounted, isPageReload, }: AsyncMountableOptions<S, E>);
    private readonly _isMounted;
    /**
     * Signal indicating if the component is mounted.
     */
    readonly isMounted: import('@tma.js/signals').Computed<boolean>;
    /**
     * Mounts the component restoring its state and calling required side effects.
     * @param options - additional execution options.
     */
    readonly mount: (options?: AsyncOptions) => TE.TaskEither<E, void>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
}
