import { Logger } from '@tma.js/toolkit';
/**
 * The current debug mode state.
 *
 * To update the value, use the `setDebug` function.
 * @see setDebug
 */
export declare const debug: import('@tma.js/signals').Computed<boolean>;
/**
 * Sets the package debug mode.
 *
 * Enabling debug mode leads to printing additional messages in the console related to the
 * processes inside the package.
 * @param value - enable debug mode.
 */
export declare function setDebug(value: boolean): void;
/**
 * The current target origin used by the `postEvent` method.
 *
 * You don't need to override this value until you know what you are doing.
 * To update the value, use the `setTargetOrigin` function.
 * @default 'https://web.telegram.org'
 * @see setTargetOrigin
 */
export declare const targetOrigin: import('@tma.js/signals').Computed<string>;
/**
 * Sets a new target origin that is being used when calling the `postEvent` function in Telegram
 * web versions.
 *
 * You don't need to override this value until you know what you are doing.
 * @param origin - allowed target origin value.
 * @see _targetOrigin
 */
export declare function setTargetOrigin(origin: string): void;
/**
 * Signal containing a custom implementation of the method to post a message to the parent
 * window. We usually use it to send a message in web versions of Telegram.
 *
 * @default A function behaving like the `window.parent.postMessage` method.
 */
export declare const postMessageImpl: import('@tma.js/signals').Signal<{
    (message: any, targetOrigin: string, transfer?: Transferable[]): void;
    (message: any, options?: WindowPostMessageOptions): void;
}>;
/**
 * The package logger. You can override this value in order to use your own implementation.
 */
export declare const logger: import('@tma.js/signals').Signal<Logger>;
/**
 * Resets the package global values. Normally, you don't use this function in your application.
 * We are using it only for test purposes.
 */
export declare function resetGlobals(): void;
