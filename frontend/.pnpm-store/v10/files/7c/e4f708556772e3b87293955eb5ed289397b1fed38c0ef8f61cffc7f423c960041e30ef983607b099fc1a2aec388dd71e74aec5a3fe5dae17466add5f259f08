import { RequestError, PostEventError, BiometryAuthRequestStatus, BiometryTokenUpdateStatus } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { BetterPromise } from 'better-promises';
import { either as E, taskEither as TE } from 'fp-ts';
import { BiometryAuthenticateOptions, BiometryOptions, BiometryRequestAccessOptions, BiometryState, BiometryUpdateTokenOptions } from './types.js';
import { AsyncOptions } from '../../types.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
type BiometryTask<T> = TE.TaskEither<RequestError, T>;
interface AuthenticateResult {
    /**
     * Authentication status.
     */
    status: BiometryAuthRequestStatus;
    /**
     * Token from the local secure storage saved previously.
     */
    token?: string;
}
/**
 * @since Mini Apps v7.2
 */
export declare class Biometry {
    constructor({ version, request, postEvent, storage, onInfoReceived, offInfoReceived, isTma, isPageReload, }: BiometryOptions);
    /**
     * Signal indicating if biometry is available.
     */
    readonly isAvailable: Computed<boolean>;
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * Signal indicating if the component is mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Complete component state.
     */
    readonly state: Computed<BiometryState>;
    /**
     * Attempts to authenticate a user using biometrics and fetch a previously stored secure token.
     * @param options - method options.
     * @since Mini Apps v7.2
     * @returns Token from the local secure storage saved previously or undefined.
     * @example
     * const { status, token } = await biometry.authenticate({
     *   reason: 'Authenticate to open wallet',
     * });
     */
    readonly authenticateFp: WithChecksFp<(options?: BiometryAuthenticateOptions) => BiometryTask<{
        /**
         * Authentication status.
         */
        status: BiometryAuthRequestStatus;
        /**
         * Token from the local secure storage saved previously.
         */
        token?: string;
    }>, true>;
    /**
     * @see authenticateFp
     */
    readonly authenticate: WithChecks<(options?: BiometryAuthenticateOptions) => BetterPromise<AuthenticateResult>, true>;
    /**
     * Opens the biometric access settings for bots. Useful when you need to request biometrics
     * access to users who haven't granted it yet.
     *
     * _Note that this method can be called only in response to user interaction with the Mini App
     * interface (e.g. a click inside the Mini App or on the main button)_.
     * @since Mini Apps v7.2
     */
    readonly openSettingsFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;
    /**
     * @see openSettingsFp
     */
    readonly openSettings: WithChecks<() => void, true>;
    /**
     * Requests permission to use biometrics.
     * @since Mini Apps v7.2
     * @returns Promise with true, if access was granted.
     * @example
     * const accessGranted = await biometry.requestAccess({
     *   reason: 'Authenticate to open wallet',
     * });
     */
    readonly requestAccessFp: WithChecksFp<(options?: BiometryRequestAccessOptions) => BiometryTask<boolean>, true>;
    /**
     * @see requestAccessFp
     */
    readonly requestAccess: WithChecks<(options?: BiometryRequestAccessOptions) => BetterPromise<boolean>, true>;
    /**
     * Updates the biometric token in a secure storage on the device.
     * @since Mini Apps v7.2
     * @returns Promise with `true`, if token was updated.
     * @example Setting a new token
     * biometry.updateToken({
     *   token: 'abcdef',
     * })
     * @example Deleting the token
     * biometry.updateToken();
     */
    readonly updateTokenFp: WithChecksFp<(options?: BiometryUpdateTokenOptions) => BiometryTask<BiometryTokenUpdateStatus>, true>;
    /**
     * @see updateTokenFp
     */
    readonly updateToken: WithChecks<(options?: BiometryUpdateTokenOptions) => BetterPromise<BiometryTokenUpdateStatus>, true>;
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v7.2
     */
    readonly mountFp: WithChecksFp<(options?: AsyncOptions) => BiometryTask<void>, true>;
    /**
     * @see mountFp
     */
    readonly mount: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, true>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
}
export {};
