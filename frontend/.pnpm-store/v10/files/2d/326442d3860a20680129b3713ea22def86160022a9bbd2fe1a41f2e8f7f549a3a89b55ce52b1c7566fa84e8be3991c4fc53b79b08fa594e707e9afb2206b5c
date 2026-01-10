import { WriteAccessRequestedStatus, RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { AsyncOptions } from '../../types.js';
export type RequestWriteAccessError = RequestError;
/**
 * Requests write message access to the current user.
 * @param options - additional options.
 * @since Mini Apps v6.9
 */
export declare const requestWriteAccessFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<RequestWriteAccessError, WriteAccessRequestedStatus>, true, never>;
/**
 * @see requestWriteAccessFp
 */
export declare const requestWriteAccess: import('../../with-checks/withChecksFp.js').WithChecks<(options?: AsyncOptions) => TE.TaskEither<RequestWriteAccessError, WriteAccessRequestedStatus>, true, never>;
