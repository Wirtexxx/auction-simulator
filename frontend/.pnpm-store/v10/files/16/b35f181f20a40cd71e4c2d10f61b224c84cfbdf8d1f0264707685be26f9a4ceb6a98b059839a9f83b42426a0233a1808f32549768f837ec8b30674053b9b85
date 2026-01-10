import { taskEither as TE } from 'fp-ts';
import { ValidationError } from '../../errors.js';
import { InvokeCustomMethodError } from '../../fn-options/withInvokeCustomMethod.js';
import { AsyncOptions } from '../../types.js';
export type GetCurrentTimeError = InvokeCustomMethodError | ValidationError;
/**
 * @returns The current time according to the Telegram server time.
 * @param options - additional options.
 * @since Mini Apps v6.9
 */
export declare const getCurrentTimeFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<GetCurrentTimeError, Date>, true, never>;
/**
 * @see getCurrentTimeFp
 */
export declare const getCurrentTime: import('../../with-checks/withChecksFp.js').WithChecks<(options?: AsyncOptions) => TE.TaskEither<GetCurrentTimeError, Date>, true, never>;
