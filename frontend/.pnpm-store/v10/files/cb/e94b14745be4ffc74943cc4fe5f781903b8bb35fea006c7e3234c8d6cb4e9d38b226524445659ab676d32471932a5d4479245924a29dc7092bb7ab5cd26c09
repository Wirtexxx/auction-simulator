import { RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { AsyncOptions } from '../../types.js';
export type ReadTextFromClipboardError = RequestError;
/**
 * Reads a text from the clipboard and returns a `string` or `null`. `null` is returned
 * in one of the following cases:
 * - A value in the clipboard is not a text.
 * - Access to the clipboard is not granted.
 * @since Mini Apps v6.4
 */
export declare const readTextFromClipboardFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(options?: AsyncOptions) => TE.TaskEither<ReadTextFromClipboardError, string | null>, true, never>;
export declare const readTextFromClipboard: import('../../with-checks/withChecksFp.js').WithChecks<(options?: AsyncOptions) => TE.TaskEither<ReadTextFromClipboardError, string | null>, true, never>;
