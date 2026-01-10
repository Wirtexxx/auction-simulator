import { RetrieveLaunchParamsError, PostEventError, PostEventFpFn } from '@tma.js/bridge';
import { Version, ThemeParams } from '@tma.js/types';
import { either as E } from 'fp-ts';
export interface InitOptions {
    /**
     * True if SDK should accept styles sent from the Telegram application.
     * @default true
     */
    acceptCustomStyles?: boolean;
    /**
     * True if the application is launched in inline mode.
     * @default Will be calculated based on the launch parameters' tgWebAppBotInline field.
     */
    isInlineMode?: boolean;
    /**
     * A custom `postEvent` function to use across the package.
     * @default tma.js/bridge's postEventFp function will be used.
     */
    postEvent?: PostEventFpFn;
    /**
     * Mini application theme parameters.
     * @default Will be calculated based on the launch parameters' tgWebAppThemeParams field.
     */
    themeParams?: ThemeParams;
    /**
     * Telegram Mini Apps version supported by the Telegram client.
     * @default Will be calculated based on the launch parameters' tgWebAppVersion field.
     */
    version?: Version;
}
/**
 * Initializes the SDK allowing it to properly handle events, sent from the native Telegram
 * application. This function also configure the package's global dependencies (functions,
 * variables used across the package).
 * @param options - function options.
 * @returns A function, to perform a cleanup.
 */
export declare function initFp(options?: InitOptions): E.Either<RetrieveLaunchParamsError | PostEventError, VoidFunction>;
/**
 * @see initFp
 */
export declare const init: ((options?: InitOptions | undefined) => VoidFunction) & {};
