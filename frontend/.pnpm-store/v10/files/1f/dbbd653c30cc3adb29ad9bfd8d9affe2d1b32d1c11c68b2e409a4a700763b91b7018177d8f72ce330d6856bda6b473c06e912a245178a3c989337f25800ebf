import { RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { DeviceStorageMethodError } from '../../errors.js';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithCreateRequestId } from '../../fn-options/withCreateRequestId.js';
import { WithRequest } from '../../fn-options/withRequest.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
export type DeviceStorageError = RequestError | DeviceStorageMethodError;
export interface DeviceStorageOptions extends SharedFeatureOptions, WithVersion, WithRequest, WithCreateRequestId {
}
/**
 * @since Mini Apps v9.0
 */
export declare class DeviceStorage {
    constructor({ isTma, request, version, createRequestId }: DeviceStorageOptions);
    /**
      * Retrieves an item using its key.
      * @since Mini Apps v9.0
      */
    readonly getItemFp: WithChecksFp<(key: string) => TE.TaskEither<DeviceStorageError, string | null>, true>;
    /**
     * @see getItemFp
     */
    readonly getItem: WithChecks<(key: string) => Promise<string | null>, true>;
    /**
      * Sets a new item in the storage.
      * @since Mini Apps v9.0
      */
    readonly setItemFp: WithChecksFp<(key: string, value: string | null) => TE.TaskEither<DeviceStorageError, void>, true>;
    /**
     * @see setItemFp
     */
    readonly setItem: WithChecks<(key: string, value: string | null) => Promise<void>, true>;
    /**
      * Removes a key from the storage.
      * @since Mini Apps v9.0
      */
    readonly deleteItemFp: WithChecksFp<(key: string) => TE.TaskEither<DeviceStorageError, void>, true>;
    /**
     * @see deleteItemFp
     */
    readonly deleteItem: WithChecks<(key: string) => Promise<void>, true>;
    /**
      * Removes all keys from the storage.
      * @since Mini Apps v9.0
      */
    readonly clearFp: WithChecksFp<() => TE.TaskEither<DeviceStorageError, void>, true>;
    /**
     * @see clearFp
     */
    readonly clear: WithChecks<() => Promise<void>, true>;
}
