import { PostEventError, MethodName, MethodParams } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { either as E } from 'fp-ts';
import { SharedFeatureOptions } from '../fn-options/sharedFeatureOptions.js';
import { WithPostEvent } from '../fn-options/withPostEvent.js';
import { WithStateRestore } from '../fn-options/withStateRestore.js';
import { WithVersion } from '../fn-options/withVersion.js';
import { WithChecksFp, WithChecks } from '../with-checks/withChecksFp.js';
type ButtonEither = E.Either<PostEventError, void>;
type BoolFields<S> = {
    [K in keyof S]-?: S[K] extends boolean ? K : never;
}[keyof S];
export interface ButtonOptions<S, M extends MethodName> extends SharedFeatureOptions, WithStateRestore<S>, WithPostEvent, WithVersion {
    /**
     * The initial button state.
     */
    initialState: S;
    /**
     * Removes a component click listener.
     * @param listener - a listener to remove.
     * @param once - should the listener be called only once.
     */
    offClick: (listener: VoidFunction, once?: boolean) => void;
    /**
     * Adds a component click listener.
     * @returns A function to remove listener.
     * @param listener - a listener to add.
     * @param once - should the listener be called only once.
     */
    onClick: (listener: VoidFunction, once?: boolean) => VoidFunction;
    /**
     * A Mini Apps method to commit changes.
     */
    method: M;
    /**
     * A function to create method payload.
     * @param state
     */
    payload: (state: S) => MethodParams<M>;
}
export declare class Button<S extends object, M extends MethodName> {
    constructor({ isTma, storage, onClick, offClick, initialState, isPageReload, postEvent, payload, method, version, }: ButtonOptions<S, M>);
    /**
     * Signal indicating if the component is currently mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * Complete button state.
     */
    readonly state: Computed<S>;
    /**
     * @returns A computed based on the specified state and its related key.
     * @param key - a key to use.
     */
    stateGetter<K extends keyof S>(key: K): Computed<S[K]>;
    /**
     * @returns A setter with checks for the specified key.
     * @param key
     */
    readonly stateSetters: <K extends keyof S>(key: K) => [
        throwing: WithChecks<(value: S[K]) => void, true>,
        fp: WithChecksFp<(value: S[K]) => ButtonEither, true>
    ];
    /**
     * @returns Setters with checks to set a specified boolean key.
     * @param key
     */
    readonly stateBoolSetters: <K extends BoolFields<S>>(key: K) => [
        setFalse: [
            throwing: WithChecks<() => void, true>,
            fp: WithChecksFp<() => ButtonEither, true>
        ],
        setTrue: [
            throwing: WithChecks<() => void, true>,
            fp: WithChecksFp<() => ButtonEither, true>
        ]
    ];
    /**
     * Updates the button state.
     */
    readonly setStateFp: WithChecksFp<(state: Partial<S>) => ButtonEither, true>;
    /**
     * @see setStateFp
     */
    readonly setState: WithChecks<(state: Partial<S>) => void, true>;
    /**
     * Adds a new button listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @returns A function to remove bound listener.
     * @example
     * const off = button.onClick(() => {
     *   console.log('User clicked the button');
     *   off();
     * });
     */
    readonly onClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => VoidFunction, true>;
    /**
     * @see onClickFp
     */
    readonly onClick: WithChecks<(listener: VoidFunction, once?: boolean) => VoidFunction, true>;
    /**
     * Removes the button click listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @example
     * function listener() {
     *   console.log('User clicked the button');
     *   button.offClick(listener);
     * }
     * button.onClick(listener);
     */
    readonly offClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => void, true>;
    /**
     * @see offClickFp
     */
    readonly offClick: WithChecks<(listener: VoidFunction, once?: boolean) => void, true>;
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v6.1
     */
    readonly mountFp: WithChecksFp<() => void, true>;
    /**
     * @see mountFp
     */
    readonly mount: WithChecks<() => void, true>;
    /**
     * Unmounts the component.
     *
     * Note that this function does not remove listeners added via the `onClick`
     * function, so you have to remove them on your own.
     * @see onClick
     */
    readonly unmount: () => void;
}
export {};
