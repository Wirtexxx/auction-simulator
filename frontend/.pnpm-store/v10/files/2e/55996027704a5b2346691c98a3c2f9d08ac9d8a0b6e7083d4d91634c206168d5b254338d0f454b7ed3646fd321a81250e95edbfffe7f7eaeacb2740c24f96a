import { PostEventError, SecondaryButtonPosition } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { RGB } from '@tma.js/types';
import { either as E } from 'fp-ts';
import { ButtonOptions } from '../../composables/Button.js';
import { MaybeAccessor } from '../../types.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
type SecondaryButtonEither = E.Either<PostEventError, void>;
export interface SecondaryButtonState {
    isVisible: boolean;
    bgColor?: RGB;
    hasShineEffect: boolean;
    isEnabled: boolean;
    isLoaderVisible: boolean;
    text: string;
    textColor?: RGB;
    position: SecondaryButtonPosition;
}
export interface SecondaryButtonOptions extends Omit<ButtonOptions<SecondaryButtonState, 'web_app_setup_secondary_button'>, 'initialState' | 'method' | 'payload'> {
    /**
     * Default values for different kinds of the button properties.
     */
    defaults: {
        bgColor: MaybeAccessor<RGB>;
        textColor: MaybeAccessor<RGB>;
    };
}
/**
 * @since Mini Apps v7.10
 */
export declare class SecondaryButton {
    constructor({ defaults, ...options }: SecondaryButtonOptions);
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * The button position relative to the main one.
     */
    readonly position: Computed<SecondaryButtonPosition>;
    /**
     * The button background color.
     */
    readonly bgColor: Computed<RGB>;
    /**
     * True if the button has a shining effect.
     */
    readonly hasShineEffect: Computed<boolean>;
    /**
     * True if the button is clickable.
     */
    readonly isEnabled: Computed<boolean>;
    /**
     * True if the button loader is visible.
     */
    readonly isLoaderVisible: Computed<boolean>;
    /**
     * True if the button is visible.
     */
    readonly isVisible: Computed<boolean>;
    /**
     * Signal indicating if the component is currently mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * The complete button state.
     */
    readonly state: Computed<SecondaryButtonState>;
    /**
     * The button displayed text.
     */
    readonly text: Computed<string>;
    /**
     * The button text color.
     *
     * Note that this value is computed based on the external defaults. For
     * example, if not explicitly set, this value may be equal to one of theme
     * params colors.
     */
    readonly textColor: Computed<RGB>;
    /**
     * Shows the button.
     * @since Mini Apps v7.10
     */
    readonly showFp: WithChecksFp<() => SecondaryButtonEither, true>;
    /**
     * @see showFp
     */
    readonly show: WithChecks<() => void, true>;
    /**
     * Hides the button.
     * @since Mini Apps v7.10
     */
    readonly hideFp: WithChecksFp<() => SecondaryButtonEither, true>;
    /**
     * @see hideFp
     */
    readonly hide: WithChecks<() => void, true>;
    /**
     * Enables the button.
     * @since Mini Apps v7.10
     */
    readonly enableFp: WithChecksFp<() => SecondaryButtonEither, true>;
    /**
     * @see enableFp
     */
    readonly enable: WithChecks<() => void, true>;
    /**
     * Enables the button.
     * @since Mini Apps v7.10
     */
    readonly enableShineEffectFp: WithChecksFp<() => SecondaryButtonEither, true>;
    /**
     * @see enableShineEffectFp
     */
    readonly enableShineEffect: WithChecks<() => void, true>;
    /**
     * Disables the button.
     * @since Mini Apps v7.10
     */
    readonly disableFp: WithChecksFp<() => SecondaryButtonEither, true>;
    /**
     * @see disableFp
     */
    readonly disable: WithChecks<() => void, true>;
    /**
     * Enables the button.
     * @since Mini Apps v7.10
     */
    readonly disableShineEffectFp: WithChecksFp<() => SecondaryButtonEither, true>;
    /**
     * @see disableShineEffectFp
     */
    readonly disableShineEffect: WithChecks<() => void, true>;
    /**
     * Updates the button background color.
     * @since Mini Apps v7.10
     */
    readonly setBgColorFp: WithChecksFp<(value: RGB) => SecondaryButtonEither, true>;
    /**
     * @see setBgColorFp
     */
    readonly setBgColor: WithChecks<(value: RGB) => void, true>;
    /**
     * Updates the button text color.
     * @since Mini Apps v7.10
     */
    readonly setTextColorFp: WithChecksFp<(value: RGB) => SecondaryButtonEither, true>;
    /**
     * @see setTextColorFp
     */
    readonly setTextColor: WithChecks<(value: RGB) => void, true>;
    /**
     * Updates the button text.
     * @since Mini Apps v7.10
     */
    readonly setTextFp: WithChecksFp<(value: string) => SecondaryButtonEither, true>;
    /**
     * @see setTextFp
     */
    readonly setText: WithChecks<(value: string) => void, true>;
    /**
     * Updates the button position.
     * @since Mini Apps v7.10
     */
    readonly setPositionFp: WithChecksFp<(position: SecondaryButtonPosition) => SecondaryButtonEither, true>;
    /**
     * @see setPositionFp
     */
    readonly setPosition: WithChecks<(position: SecondaryButtonPosition) => void, true>;
    /**
     * Shows the button loader.
     * @since Mini Apps v7.10
     */
    readonly showLoaderFp: WithChecksFp<() => SecondaryButtonEither, true>;
    /**
     * @see showLoaderFp
     */
    readonly showLoader: WithChecks<() => void, true>;
    /**
     * Hides the button loader.
     * @since Mini Apps v7.10
     */
    readonly hideLoaderFp: WithChecksFp<() => SecondaryButtonEither, true>;
    /**
     * @see hideLoaderFp
     */
    readonly hideLoader: WithChecks<() => void, true>;
    /**
     * Updates the button state.
     * @param state - updates to apply.
     * @since Mini Apps v7.10
     * @example
     * button.setParams({
     *   text: 'Submit',
     *   isEnabled: true,
     *   hasShineEffect: true,
     * });
     */
    readonly setParamsFp: WithChecksFp<(state: Partial<SecondaryButtonState>) => SecondaryButtonEither, true>;
    /**
     * @see setParamsFp
     */
    readonly setParams: WithChecks<(state: Partial<SecondaryButtonState>) => void, true>;
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v7.10
     */
    readonly mountFp: WithChecksFp<() => void, true>;
    /**
     * @see mountFp
     */
    readonly mount: WithChecks<() => void, true>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
    /**
     * Adds a new button listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @returns A function to remove bound listener.
     * @since Mini Apps v7.10
     * @example
     * const off = button.onClick(() => {
     *   console.log('User clicked the button');
     *   off();
     * });
     */
    readonly onClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => VoidFunction, true>;
    /**
     * @see onClick
     */
    readonly onClick: WithChecks<(listener: VoidFunction, once?: boolean) => VoidFunction, true>;
    /**
     * Removes the button click listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @since Mini Apps v7.10
     * @example
     * function listener() {
     *   console.log('User clicked the button');
     *   button.offClick(listener);
     * }
     * button.onClick(listener);
     */
    readonly offClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => void, true>;
    /**
     * @see offClick
     */
    readonly offClick: WithChecks<(listener: VoidFunction, once?: boolean) => void, true>;
}
export {};
