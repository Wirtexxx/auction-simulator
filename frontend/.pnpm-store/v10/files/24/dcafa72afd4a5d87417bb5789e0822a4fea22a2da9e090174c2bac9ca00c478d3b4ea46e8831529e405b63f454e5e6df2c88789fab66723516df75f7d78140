import { RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { SecureStorageMethodError } from '../../errors.js';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithCreateRequestId } from '../../fn-options/withCreateRequestId.js';
import { WithRequest } from '../../fn-options/withRequest.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
export type SecureStorageError = RequestError | SecureStorageMethodError;
export interface SecureStorageOptions extends SharedFeatureOptions, WithVersion, WithRequest, WithCreateRequestId {
}
/**
 * @since Mini Apps v9.0
 */
export declare class SecureStorage {
    constructor({ isTma, request, version, createRequestId }: SecureStorageOptions);
    /**
      * Retrieves an item using its key.
      * @since Mini Apps v9.0
      */
    readonly getItemFp: WithChecksFp<(key: string) => TE.TaskEither<SecureStorageError, {
        value: string | null;
        canRestore: boolean;
    }>, true>;
    /**
     * @see getItemFp
     */
    readonly getItem: WithChecks<(key: string) => Promise<{
        value: string | null;
        canRestore: boolean;
    }>, true>;
    /**
     * Restores an item from the storage.
     * @since Mini Apps v9.0
     */
    readonly restoreItemFp: WithChecksFp<(key: string) => TE.TaskEither<SecureStorageError, string | null>, true>;
    /**
     * @see restoreItemFp
     */
    readonly restoreItem: WithChecks<(key: string) => Promise<string | null>, true>;
    /**
      * Sets a new item in the storage.
      * @since Mini Apps v9.0
      */
    readonly setItemFp: WithChecksFp<(key: string, value: string | null) => TE.TaskEither<SecureStorageError, void>, true>;
    /**
     * @see setItemFp
     */
    readonly setItem: WithChecks<(key: string, value: string | null) => Promise<void>, true>;
    /**
      * Removes a key from the storage.
      * @since Mini Apps v9.0
      */
    readonly deleteItemFp: WithChecksFp<(key: string) => TE.TaskEither<SecureStorageError, void>, true>;
    /**
     * @see deleteItemFp
     */
    readonly deleteItem: WithChecks<(key: string) => Promise<void>, true>;
    /**
      * Removes all keys from the storage.
      * @since Mini Apps v9.0
      */
    readonly clearFp: WithChecksFp<() => TE.TaskEither<SecureStorageError, void>, true>;
    /**
     * @see clearFp
     */
    readonly clear: WithChecks<() => Promise<void>, true>;
}
