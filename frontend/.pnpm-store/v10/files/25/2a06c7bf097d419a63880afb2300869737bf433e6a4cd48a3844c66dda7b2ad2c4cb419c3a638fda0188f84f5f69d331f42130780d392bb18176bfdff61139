import { PhoneRequestedStatus, RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { AsyncOptions } from '../../types.js';
export type RequestPhoneAccessError = RequestError;
/**
 * Requests current user phone access. Method returns promise, which resolves
 * status of the request. In case, user accepted the request, Mini App bot will receive
 * the according notification.
 *
 * To obtain the retrieved information instead, utilize the `requestContact` method.
 * @param options - additional options.
 * @since Mini Apps v6.9
 * @see requestContact
 */
export declare const requestPhoneAccessFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<RequestPhoneAccessError, PhoneRequestedStatus>, true, never>;
/**
 * @see requestPhoneAccessFp
 */
export declare const requestPhoneAccess: import('../../with-checks/withChecksFp.js').WithChecks<(options?: AsyncOptions) => TE.TaskEither<RequestPhoneAccessError, PhoneRequestedStatus>, true, never>;
