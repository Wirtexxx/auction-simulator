import { BetterTaskEitherError } from '@tma.js/toolkit';
import { taskEither as TE } from 'fp-ts';
import { AccessDeniedError, ValidationError } from '../../errors.js';
import { InvokeCustomMethodError } from '../../fn-options/withInvokeCustomMethod.js';
import { AsyncOptions } from '../../types.js';
/**
 * Requested contact information.
 */
export interface RequestedContact {
    contact: {
        user_id: number;
        phone_number: string;
        first_name: string;
        last_name?: string;
        [key: string]: unknown;
    };
    auth_date: Date;
    hash: string;
    [key: string]: unknown;
}
/**
 * Requested contact complete data.
 */
export interface RequestedContactCompleteData {
    /**
     * Raw original representation of the contact data returned from the Telegram server.
     */
    raw: string;
    /**
     * Parsed representation of the contact data.
     */
    parsed: RequestedContact;
}
export type RequestContactError = InvokeCustomMethodError | AccessDeniedError | ValidationError | BetterTaskEitherError;
/**
 * Requests current user contact information.
 *
 * This function returns an object, containing both raw and parsed representations of a response,
 * received from the Telegram client.
 * @param options - additional options.
 * @since Mini Apps v6.9
 */
export declare const requestContactCompleteFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<RequestContactError, RequestedContactCompleteData>, true, never>;
/**
 * @see requestContactCompleteFp
 */
export declare const requestContactComplete: import('../../with-checks/withChecksFp.js').WithChecks<(options?: AsyncOptions) => TE.TaskEither<RequestContactError, RequestedContactCompleteData>, true, never>;
/**
 * Works the same way as the `requestContactCompleteFp` function, but returns only parsed
 * representation of the contact data.
 * @see requestContactCompleteFp
 * @param options - additional options.
 * @since Mini Apps v6.9
 */
export declare const requestContactFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<RequestContactError, RequestedContact>, true, never>;
/**
 * @see requestContactFp
 */
export declare const requestContact: import('../../with-checks/withChecksFp.js').WithChecks<(options?: AsyncOptions) => TE.TaskEither<RequestContactError, RequestedContact>, true, never>;
