import { PostEventError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { either as E } from 'fp-ts';
import { ButtonOptions } from '../../composables/Button.js';
import { WithChecksFp, WithChecks } from '../../with-checks/withChecksFp.js';
export interface SettingsButtonState {
    isVisible: boolean;
}
export type SettingsButtonOptions = Omit<ButtonOptions<SettingsButtonState, 'web_app_setup_settings_button'>, 'method' | 'payload' | 'initialState'>;
/**
 * @since Mini Apps v6.10
 */
export declare class SettingsButton {
    constructor(options: SettingsButtonOptions);
    /**
     * Signal indicating if the component is currently visible.
     */
    readonly isVisible: Computed<boolean>;
    /**
     * Signal indicating if the component is currently mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * Hides the button.
     * @since Mini Apps v6.10
     */
    readonly hideFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;
    /**
     * @see hideFp
     */
    readonly hide: WithChecks<() => void, true>;
    /**
     * Shows the button.
     * @since Mini Apps v6.10
     */
    readonly showFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;
    /**
     * @see showFp
     */
    readonly show: WithChecks<() => void, true>;
    /**
     * Adds a new button listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @returns A function to remove bound listener.
     * @since Mini Apps v6.10
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
     * @since Mini Apps v6.10
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
     * @since Mini Apps v6.10
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
