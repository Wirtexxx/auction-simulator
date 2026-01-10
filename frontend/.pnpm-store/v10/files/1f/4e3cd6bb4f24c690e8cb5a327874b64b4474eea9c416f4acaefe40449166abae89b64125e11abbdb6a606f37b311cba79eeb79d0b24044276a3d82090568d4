import { RequestError, PostEventError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { BetterPromise } from 'better-promises';
import { either as E, taskEither as TE } from 'fp-ts';
import { LocationManagerOptions, LocationManagerRequestLocationResponse, LocationManagerState } from './types.js';
import { AsyncOptions } from '../../types.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
/**
 * @since Mini Apps v8.0
 */
export declare class LocationManager {
    constructor({ version, request, postEvent, storage, isTma, isPageReload, }: LocationManagerOptions);
    /**
     * Complete location manager state.
     */
    readonly state: Computed<LocationManagerState>;
    /**
     * Signal indicating whether the location data tracking is currently available.
     */
    readonly isAvailable: Computed<boolean>;
    /**
     * Signal indicating whether the user has granted the app permission to track location data.
     */
    readonly isAccessGranted: Computed<boolean>;
    /**
     * Signal indicating whether the app has previously requested permission to track location data.
     */
    readonly isAccessRequested: Computed<boolean>;
    /**
     * Signal indicating if the component is currently mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * Opens the location access settings for bots. Useful when you need to request location access
     * from users who haven't granted it yet.
     *
     * Note that this method can be called only in response to user interaction with the Mini App
     * interface (e.g., a click inside the Mini App or on the main button).
     * @since Mini Apps v8.0
     */
    readonly openSettingsFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;
    /**
     * @see openSettingsFp
     */
    readonly openSettings: WithChecks<() => void, true>;
    /**
     * Requests location data.
     * @since Mini Apps v8.0
     * @returns Promise with location data or null it access was not granted.
     */
    readonly requestLocationFp: WithChecksFp<(options?: AsyncOptions) => (TE.TaskEither<RequestError, LocationManagerRequestLocationResponse | null>), true>;
    /**
     * @see requestLocationFp
     */
    readonly requestLocation: WithChecks<(options?: AsyncOptions) => BetterPromise<LocationManagerRequestLocationResponse | null>, true>;
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v8.0
     */
    readonly mountFp: WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<RequestError, void>, true>;
    /**
     * @see mountFp
     */
    readonly mount: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, true>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
}
