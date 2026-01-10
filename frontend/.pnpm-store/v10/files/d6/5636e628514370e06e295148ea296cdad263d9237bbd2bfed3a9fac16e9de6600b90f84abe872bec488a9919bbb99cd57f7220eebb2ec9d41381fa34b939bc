import { LaunchParamsLike } from '@tma.js/transformers';
import { MethodName, MethodParams } from '../methods/types/index.js';
/**
 * Mocks the environment and imitates Telegram Mini Apps behavior.
 *
 * We usually use this function in the following cases:
 * 1. We are developing an application outside the Telegram environment and would like to imitate
 * the Telegram client in order to re-create the same communication behavior.
 * 2. We would like to intercept some Telegram Mini Apps methods' calls in order to enhance them
 * or write a custom behavior. It is extremely useful in some Telegram clients improperly handling
 * Mini Apps methods' calls and not even responding.
 *
 * Note that calling this function in Telegram web clients, the `postMessageImplementation` signal
 * value will be updated with a new one, enhancing previously set signal value to allow wrapping
 * the original `window.parent.postMessage` function. In other words, calling `mockTelegramEnv`
 * function N times, you will effectively wrap previously set implementation N times, so be
 * careful calling this function several times during a single lifecycle of the app. In case you
 * would like to avoid such kind of behavior, use the `resetPostMessage` option.
 */
export declare function mockTelegramEnv({ launchParams, onEvent, resetPostMessage }?: {
    /**
     * Launch parameters to mock. They will be saved in the storage, so the SDK functions could
     * retrieve them.
     *
     * Note that this value must have `tgWebAppData` presented in a raw format as long as you will
     * need it when retrieving init data in this format. Otherwise, init data may be broken.
     */
    launchParams?: (Omit<LaunchParamsLike, 'tgWebAppData'> & {
        tgWebAppData?: string | URLSearchParams;
    }) | string | URLSearchParams;
    /**
     * Function that will be called if a Mini Apps method call was requested by the mini app.
     *
     * It receives a Mini Apps method name along with the passed payload.
     *
     * Note that using the `next` function, in non-web environments it uses the
     * `window.TelegramWebviewProxy.postEvent` method.
     *
     * Talking about the web versions of Telegram, the value of `next` is a bit more complex - it
     * will be equal to the value stored in the `postMessageImpl` signal set previously. By default,
     * this value contains a function utilizing the `window.parent.postMessage` method.
     * @param event - event information.
     * @param next - function to call the original method used to call a Mini Apps method.
     */
    onEvent?: (event: {
        [M in MethodName]: {
            name: M;
            params: MethodParams<M>;
        };
    }[MethodName] | {
        name: string;
        params: unknown;
    }, next: () => void) => void;
    /**
     * Removes all previously set enhancements of the `window.parent.postMessage` function set
     * by other `mockTelegramEnv` calls.
     * @default false
     */
    resetPostMessage?: boolean;
}): void;
