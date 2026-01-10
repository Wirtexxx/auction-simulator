import { EventListener } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { ThemeParams as ThemeParamsType, RGB } from '@tma.js/types';
import { either as E } from 'fp-ts';
import { CSSVarsBoundError } from '../../errors.js';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithStateRestore } from '../../fn-options/withStateRestore.js';
import { MaybeAccessor } from '../../types.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
export type ThemeParamsState = ThemeParamsType;
export interface ThemeParamsOptions extends WithStateRestore<ThemeParamsState>, SharedFeatureOptions {
    /**
     * Removes a theme change listener.
     * @param listener - a listener to remove.
     */
    offChange: (listener: EventListener<'theme_changed'>) => void;
    /**
     * Adds a theme change listener.
     * @returns A function to remove listener.
     * @param listener - a listener to add.
     */
    onChange: (listener: EventListener<'theme_changed'>) => void;
    /**
     * Theme parameters initial state.
     */
    initialState: MaybeAccessor<ThemeParamsType>;
}
export interface ThemeParamsGetCssVarNameFn {
    /**
     * @param property - palette key.
     * @returns Computed complete CSS variable name.
     */
    (property: Extract<keyof ThemeParamsType, string>): string;
}
export declare class ThemeParams {
    constructor({ initialState, onChange, offChange, isTma, storage, isPageReload, }: ThemeParamsOptions);
    /**
     * @since v6.10
     */
    readonly accentTextColor: Computed<RGB | undefined>;
    readonly bgColor: Computed<RGB | undefined>;
    readonly buttonColor: Computed<RGB | undefined>;
    readonly buttonTextColor: Computed<RGB | undefined>;
    /**
     * @since v7.10
     */
    readonly bottomBarBgColor: Computed<RGB | undefined>;
    readonly destructiveTextColor: Computed<RGB | undefined>;
    /**
     * @since v6.10
     */
    readonly headerBgColor: Computed<RGB | undefined>;
    readonly hintColor: Computed<RGB | undefined>;
    readonly linkColor: Computed<RGB | undefined>;
    readonly secondaryBgColor: Computed<RGB | undefined>;
    /**
     * @since v6.10
     */
    readonly sectionBgColor: Computed<RGB | undefined>;
    /**
     * @since v6.10
     */
    readonly sectionHeaderTextColor: Computed<RGB | undefined>;
    /**
     * @since v7.6
     */
    readonly sectionSeparatorColor: Computed<RGB | undefined>;
    /**
     * @since v6.10
     */
    readonly subtitleTextColor: Computed<RGB | undefined>;
    readonly textColor: Computed<RGB | undefined>;
    private readonly _isCssVarsBound;
    /**
     * True if CSS variables are currently bound.
     */
    readonly isCssVarsBound: Computed<boolean>;
    /**
     * Creates CSS variables connected with the current theme parameters.
     *
     * By default, created CSS variables names are following the pattern "--tg-theme-{name}", where
     * {name} is a theme parameters key name converted from snake case to kebab case.
     *
     * Default variables:
     * - `--tg-theme-bg-color`
     * - `--tg-theme-secondary-text-color`
     *
     * Variables are being automatically updated if theme parameters were changed.
     *
     * @param getCSSVarName - function, returning complete CSS variable name for the specified
     * theme parameters key.
     * @returns Function to stop updating variables.
     * @throws {CSSVarsBoundError} CSS variables are already bound
     * @example Using custom CSS vars generator
     * themeParams.bindCssVars(key => `--my-prefix-${key}`);
     */
    readonly bindCssVarsFp: WithChecksFp<(getCSSVarName?: ThemeParamsGetCssVarNameFn) => E.Either<CSSVarsBoundError, VoidFunction>, false>;
    /**
     * @see bindCssVarsFp
     */
    readonly bindCssVars: WithChecks<(getCSSVarName?: ThemeParamsGetCssVarNameFn) => VoidFunction, false>;
    /**
     * Complete component state.
     */
    readonly state: Computed<ThemeParamsType>;
    /**
     * @returns True if the current color scheme is recognized as dark.
     * This value is calculated based on the current theme's background color.
     */
    readonly isDark: Computed<boolean>;
    /**
     * Signal indicating if the component is currently mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Mounts the component restoring its state.
     */
    readonly mountFp: WithChecksFp<() => E.Either<never, void>, false>;
    /**
     * @see mountFp
     */
    readonly mount: WithChecks<() => void, false>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
}
