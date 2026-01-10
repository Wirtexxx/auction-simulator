import { PostEventError, EventPayload } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { KnownThemeParamsKey, RGB, ThemeParams } from '@tma.js/types';
import { either as E } from 'fp-ts';
import { CSSVarsBoundError, UnknownThemeParamsKeyError } from '../../errors.js';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithPostEvent } from '../../fn-options/withPostEvent.js';
import { WithStateRestore } from '../../fn-options/withStateRestore.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
type AnyColor = RGB | KnownThemeParamsKey | string;
export interface MiniAppState {
    bgColor: AnyColor;
    bottomBarColor: AnyColor;
    headerColor: AnyColor;
    isActive: boolean;
}
export interface MiniAppGetCssVarNameFn {
    /**
     * @param property - mini app property.
     * @returns Computed complete CSS variable name.
     */
    (property: 'bgColor' | 'bottomBarColor' | 'headerColor'): string;
}
type WithListeners<Handlers extends string, Payload> = {
    [K in Handlers]: (listener: (payload: Payload) => void) => void;
};
export interface MiniAppOptions extends WithPostEvent, WithVersion, WithStateRestore<MiniAppState>, WithListeners<'onVisibilityChanged' | 'offVisibilityChanged', EventPayload<'visibility_changed'>>, SharedFeatureOptions {
    /**
     * The current theme parameters.
     */
    theme: Computed<ThemeParams>;
}
/**
 * @since Mini Apps v6.1
 */
export declare class MiniApp {
    constructor({ storage, isPageReload, version, postEvent, isTma, theme, onVisibilityChanged, offVisibilityChanged, }: MiniAppOptions);
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * True if the current Mini App background color is recognized as dark.
     */
    readonly isDark: Computed<boolean>;
    /**
     * Signal indicating if the mini app is currently active.
     */
    readonly isActive: Computed<boolean>;
    /**
     * Complete component state.
     */
    readonly state: Computed<MiniAppState>;
    /**
     * True if the CSS variables are currently bound.
     */
    readonly isCssVarsBound: Computed<boolean>;
    /**
     * Creates CSS variables connected with the mini app.
     *
     * Default variables:
     * - `--tg-bg-color`
     * - `--tg-header-color`
     * - `--tg-bottom-bar-color`
     *
     * Variables are being automatically updated if theme parameters were changed.
     *
     * @param getCSSVarName - function, returning complete CSS variable name for the specified
     * mini app key.
     * @returns Function to stop updating variables.
     * @example Using no arguments
     * miniApp.bindCssVars();
     * @example Using custom CSS vars generator
     * miniApp.bindCssVars(key => `--my-prefix-${key}`);
     */
    readonly bindCssVarsFp: WithChecksFp<(getCssVarName?: MiniAppGetCssVarNameFn) => E.Either<CSSVarsBoundError, VoidFunction>, false>;
    readonly bindCssVars: WithChecks<(getCssVarName?: MiniAppGetCssVarNameFn) => VoidFunction, false>;
    /**
     * Signal indicating if the component is mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Mounts the component.
     *
     * This function restores the component state and is automatically saving it in the local storage
     * if it changed.
     * @since Mini Apps v6.1
     */
    readonly mountFp: WithChecksFp<() => void, false>;
    /**
     * @see mount
     */
    readonly mount: WithChecks<() => void, false>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
    /**
     * The Mini App background color.
     *
     * Represents an RGB color, or theme parameters key, like "bg_color", "secondary_bg_color", etc.
     *
     * Note that using a theme parameters key, background color becomes bound to the current
     * theme parameters, making it automatically being updated whenever theme parameters change.
     * In order to remove this bind, use an explicit RGB color.
     */
    readonly bgColor: Computed<AnyColor>;
    /**
     * RGB representation of the background color.
     *
     * This value requires the Theme Params component to be mounted to extract a valid RGB value
     * of the color key.
     */
    readonly bgColorRgb: Computed<RGB | undefined>;
    /**
     * Updates the mini app background color.
     * @since Mini Apps v6.1
     */
    readonly setBgColorFp: WithChecksFp<(color: AnyColor) => E.Either<PostEventError | UnknownThemeParamsKeyError, void>, true>;
    /**
     * @see setBgColorFp
     */
    readonly setBgColor: WithChecks<(color: AnyColor) => void, true>;
    /**
     * The Mini App header color.
     */
    readonly headerColor: Computed<AnyColor>;
    /**
     * RGB representation of the header color.
     *
     * This value requires the Theme Params component to be mounted to extract a valid RGB value
     * of the color key.
     */
    readonly headerColorRgb: Computed<RGB | undefined>;
    /**
     * Updates the mini app header color.
     * @since Mini Apps v6.1
     */
    readonly setHeaderColorFp: WithChecksFp<(color: AnyColor) => E.Either<PostEventError | UnknownThemeParamsKeyError, void>, true, 'rgb'>;
    /**
     * @see setHeaderColorFp
     */
    readonly setHeaderColor: WithChecks<(color: AnyColor) => void, true, 'rgb'>;
    /**
     * The Mini App bottom bar background color.
     */
    readonly bottomBarColor: Computed<AnyColor>;
    /**
     * RGB representation of the bottom bar background color.
     *
     * This value requires the Theme Params component to be mounted to extract a valid RGB value
     * of the color key.
     */
    readonly bottomBarColorRgb: Computed<RGB | undefined>;
    /**
     * Updates the mini app bottom bar bg color.
     * @since Mini Apps v7.10
     */
    readonly setBottomBarColorFp: WithChecksFp<(color: AnyColor) => E.Either<PostEventError | UnknownThemeParamsKeyError, void>, true>;
    /**
     * @see setBottomBarColorFp
     */
    readonly setBottomBarColor: WithChecks<(color: AnyColor) => void, true>;
    /**
     * Closes the Mini App.
     * @param returnBack - should the client return to the previous activity.
     */
    readonly closeFp: WithChecksFp<(returnBack?: boolean) => E.Either<PostEventError, void>, false>;
    /**
     * @see closeFp
     */
    readonly close: WithChecks<(returnBack?: boolean) => void, false>;
    /**
     * Informs the Telegram app that the Mini App is ready to be displayed.
     *
     * It is recommended to call this method as early as possible, as soon as all
     * essential interface elements loaded.
     *
     * Once this method is called, the loading placeholder is hidden and the Mini
     * App shown.
     *
     * If the method is not called, the placeholder will be hidden only when the
     * page was fully loaded.
     */
    readonly readyFp: WithChecksFp<() => E.Either<PostEventError, void>, false>;
    /**
     * @see readyFp
     */
    readonly ready: WithChecks<() => void, false>;
}
export {};
