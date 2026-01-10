import { SafeAreaInsets, EventListener, RequestError, PostEventError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { BetterPromise } from 'better-promises';
import { either as E, taskEither as TE } from 'fp-ts';
import { CSSVarsBoundError, FullscreenFailedError } from '../../errors.js';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithPostEvent } from '../../fn-options/withPostEvent.js';
import { WithRequest } from '../../fn-options/withRequest.js';
import { WithStateRestore } from '../../fn-options/withStateRestore.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { AsyncOptions } from '../../types.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
type FullscreenError = FullscreenFailedError | RequestError;
type ViewportChangedEventListener = EventListener<'viewport_changed'>;
type FullscreenChangedEventListener = EventListener<'fullscreen_changed'>;
type SafeAreaInsetsChangedEventListener = EventListener<'safe_area_changed'>;
type SafeAreaInsetCSSVarKey = `safeAreaInset${Capitalize<keyof SafeAreaInsets>}`;
export type GetCSSVarNameKey = 'width' | 'height' | 'stableHeight' | SafeAreaInsetCSSVarKey | `content${Capitalize<SafeAreaInsetCSSVarKey>}`;
export type GetCSSVarNameFn = (key: GetCSSVarNameKey) => string | null | undefined | false;
export interface ViewportState {
    contentSafeAreaInsets: SafeAreaInsets;
    height: number;
    isExpanded: boolean;
    isFullscreen: boolean;
    safeAreaInsets: SafeAreaInsets;
    stableHeight: number;
    width: number;
}
type WithListeners<On extends string, Off extends string, L> = {
    [K in On | Off]: (listener: L) => void;
};
export interface ViewportOptions<EViewportStable, EFullscreen> extends WithStateRestore<ViewportState>, WithVersion, WithRequest, WithPostEvent, WithListeners<'onViewportChanged', 'offViewportChanged', ViewportChangedEventListener>, WithListeners<'onFullscreenChanged', 'offFullscreenChanged', FullscreenChangedEventListener>, WithListeners<'onSafeAreaInsetsChanged', 'offSafeAreaInsetsChanged', SafeAreaInsetsChangedEventListener>, WithListeners<'onContentSafeAreaInsetsChanged', 'offContentSafeAreaInsetsChanged', SafeAreaInsetsChangedEventListener>, SharedFeatureOptions {
    /**
     * True if the viewport is stable.
     */
    isViewportStable: boolean | (() => E.Either<EViewportStable, boolean>);
    /**
     * True if the application was opened in fullscreen initially.
     */
    isFullscreen: boolean | (() => E.Either<EFullscreen, boolean>);
}
export declare class Viewport<EViewportStable, EFullscreen> {
    constructor({ storage, isPageReload, onContentSafeAreaInsetsChanged, onSafeAreaInsetsChanged, onViewportChanged, onFullscreenChanged, offContentSafeAreaInsetsChanged, offFullscreenChanged, offSafeAreaInsetsChanged, offViewportChanged, request, isViewportStable, isFullscreen, isTma, version, postEvent, }: ViewportOptions<EViewportStable, EFullscreen>);
    /**
     * Complete component state.
     */
    readonly state: Computed<ViewportState>;
    /**
     * Signal containing the current height of the **visible area** of the Mini App.
     *
     * The application can display just the top part of the Mini App, with its
     * lower part remaining outside the screen area. From this position, the user
     * can "pull" the Mini App to its maximum height, while the bot can do the same
     * by calling `expand` method. As the position of the Mini App changes, the
     * current height value of the visible area will be updated  in real time.
     *
     * Please note that the refresh rate of this value is not sufficient to
     * smoothly follow the lower border of the window. It should not be used to pin
     * interface elements to the bottom of the visible area. It's more appropriate
     * to use the value of the `stableHeight` field for this purpose.
     *
     * @see stableHeight
     */
    readonly height: Computed<number>;
    /**
     * Signal containing the height of the visible area of the Mini App in its last stable state.
     *
     * The application can display just the top part of the Mini App, with its
     * lower part remaining outside the screen area. From this position, the user
     * can "pull" the Mini App to its maximum height, while the application can do
     * the same by calling `expand` method.
     *
     * Unlike the value of `height`, the value of `stableHeight` does not change as
     * the position of the Mini App changes with user gestures or during
     * animations. The value of `stableHeight` will be updated after all gestures
     * and animations are completed and the Mini App reaches its final size.
     *
     * @see height
     */
    readonly stableHeight: Computed<number>;
    /**
     * Signal containing the currently visible area width.
     */
    readonly width: Computed<number>;
    /**
     * Signal indicating if the Mini App is expanded to the maximum available height. Otherwise,
     * if the Mini App occupies part of the screen and can be expanded to the full
     * height using the `expand` method.
     */
    readonly isExpanded: Computed<boolean>;
    /**
     * Signal indicating if the current viewport height is stable and is not going to change in
     * the next moment.
     */
    readonly isStable: Computed<boolean>;
    /**
     * Signal containing content safe area insets.
     */
    readonly contentSafeAreaInsets: Computed<SafeAreaInsets>;
    /**
     * Signal containing top content safe area inset.
     */
    readonly contentSafeAreaInsetTop: Computed<number>;
    /**
     * Signal containing left content safe area inset.
     */
    readonly contentSafeAreaInsetLeft: Computed<number>;
    /**
     * Signal containing right content safe area inset.
     */
    readonly contentSafeAreaInsetRight: Computed<number>;
    /**
     * Signal containing bottom content safe area inset.
     */
    readonly contentSafeAreaInsetBottom: Computed<number>;
    /**
     * Signal containing safe area insets.
     */
    readonly safeAreaInsets: Computed<SafeAreaInsets>;
    /**
     * Signal containing top safe area inset.
     */
    readonly safeAreaInsetTop: Computed<number>;
    /**
     * Signal containing left safe area inset.
     */
    readonly safeAreaInsetLeft: Computed<number>;
    /**
     * Signal containing right safe area inset.
     */
    readonly safeAreaInsetRight: Computed<number>;
    /**
     * Signal containing bottom safe area inset.
     */
    readonly safeAreaInsetBottom: Computed<number>;
    /**
     * Signal indicating if the viewport is currently in fullscreen mode.
     */
    readonly isFullscreen: Computed<boolean>;
    /**
     * Requests fullscreen mode for the mini application.
     * @since Mini Apps v8.0
     */
    readonly requestFullscreenFp: WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<FullscreenError, void>, true>;
    /**
     * @see requestFullscreenFp
     */
    readonly requestFullscreen: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, true>;
    /**
     * Exits mini application from the fullscreen mode.
     * @since Mini Apps v8.0
     */
    readonly exitFullscreenFp: WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<FullscreenError, void>, true>;
    /**
     * @see exitFullscreenFp
     */
    readonly exitFullscreen: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, true>;
    /**
     * Signal indicating if CSS variables are bound.
     */
    readonly isCssVarsBound: Computed<boolean>;
    /**
     * Creates CSS variables connected with the current viewport.
     *
     * By default, created CSS variables names are following the pattern "--tg-theme-{name}", where
     * {name} is a viewport property name converted from camel case to kebab case.
     *
     * Default variables:
     * - `--tg-viewport-height`
     * - `--tg-viewport-width`
     * - `--tg-viewport-stable-height`
     * - `--tg-viewport-content-safe-area-inset-top`
     * - `--tg-viewport-content-safe-area-inset-bottom`
     * - `--tg-viewport-content-safe-area-inset-left`
     * - `--tg-viewport-content-safe-area-inset-right`
     * - `--tg-viewport-safe-area-inset-top`
     * - `--tg-viewport-safe-area-inset-bottom`
     * - `--tg-viewport-safe-area-inset-left`
     * - `--tg-viewport-safe-area-inset-right`
     *
     * Variables are being automatically updated if the viewport was changed.
     *
     * @param getCSSVarName - function, returning computed complete CSS variable name. The CSS
     * variable will only be defined if the function returned non-empty string value.
     * @returns Function to stop updating variables.
     * @example Using no arguments
     * bindCssVarsFp();
     * @example Using custom CSS vars generator
     * bindCssVarsFp(key => `--my-prefix-${key}`);
     */
    readonly bindCssVarsFp: WithChecksFp<(getCSSVarName?: GetCSSVarNameFn) => (E.Either<CSSVarsBoundError, VoidFunction>), false>;
    /**
     * @see bindCssVarsFp
     */
    readonly bindCssVars: WithChecks<(getCSSVarName?: GetCSSVarNameFn) => VoidFunction, false>;
    /**
     * Signal indicating if the component is currently mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Mounts the component.
     */
    readonly mountFp: WithChecksFp<(options?: AsyncOptions) => (TE.TaskEither<EFullscreen | EViewportStable | RequestError, void>), false>;
    /**
     * @see mountFp
     */
    readonly mount: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, false>;
    /**
     * A method that expands the Mini App to the maximum available height. To find
     * out if the Mini App is expanded to the maximum height, refer to the value of
     * the `isExpanded`.
     */
    readonly expandFp: WithChecksFp<() => E.Either<PostEventError, void>, false>;
    /**
     * @see expandFp
     */
    readonly expand: WithChecks<() => void, false>;
}
export {};
