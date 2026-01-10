import { RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { ShareMessageError } from '../../errors.js';
import { AsyncOptions } from '../../types.js';
export type ShareMessageFnError = RequestError | ShareMessageError;
/**
 * Opens a dialog allowing the user to share a message provided by the bot.
 * @since Mini Apps v8.0
 */
export declare const shareMessageFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(messageId: string, options?: AsyncOptions) => TE.TaskEither<ShareMessageFnError, void>, true, never>;
/**
 * @see shareMessageFp
 */
export declare const shareMessage: import('../../with-checks/withChecksFp.js').WithChecks<(messageId: string, options?: AsyncOptions) => TE.TaskEither<ShareMessageFnError, void>, true, never>;
