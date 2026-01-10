import { RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { SetEmojiStatusError } from '../../errors.js';
import { AsyncOptions } from '../../types.js';
export interface SetEmojiStatusOptions extends AsyncOptions {
    duration?: number;
}
/**
 * Opens a dialog allowing the user to set the specified custom emoji as their status.
 * @returns Nothing if status set was successful.
 * @param options - additional options.
 * @since Mini Apps v8.0
 * @example
 * fn.pipe(
 *   setEmojiStatusFp('5361800828313167608'),
 *   TE.match(error => {
 *     console.error('Error occurred', error);
 *   }, () => {
 *     console.log('Status set');
 *   }),
 * );
 * const statusSet = await setEmojiStatus('5361800828313167608');
 */
export declare const setEmojiStatusFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(customEmojiId: string, options?: SetEmojiStatusOptions) => TE.TaskEither<RequestError | SetEmojiStatusError, void>, true, never>;
/**
 * @see setEmojiStatusFp
 */
export declare const setEmojiStatus: import('../../with-checks/withChecksFp.js').WithChecks<(customEmojiId: string, options?: SetEmojiStatusOptions) => TE.TaskEither<RequestError | SetEmojiStatusError, void>, true, never>;
