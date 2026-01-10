import { EmojiStatusAccessRequestedStatus, RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { AsyncOptions } from '../../types.js';
/**
 * Shows a native popup requesting permission for the bot to manage user's emoji status.
 * @param options - additional options.
 * @returns Emoji status access status.
 * @since Mini Apps v8.0
 * @example
 * const status = await requestEmojiStatusAccess();
 */
export declare const requestEmojiStatusAccessFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(options: AsyncOptions) => TE.TaskEither<RequestError, EmojiStatusAccessRequestedStatus>, true, never>;
/**
 * @see requestEmojiStatusAccessFp
 */
export declare const requestEmojiStatusAccess: import('../../with-checks/withChecksFp.js').WithChecks<(options: AsyncOptions) => TE.TaskEither<RequestError, EmojiStatusAccessRequestedStatus>, true, never>;
