import { PostEventError } from '@tma.js/bridge';
import { either as E } from 'fp-ts';
import { InvalidArgumentsError } from '../../errors.js';
export type OpenTelegramLinkError = PostEventError | InvalidArgumentsError;
/**
 * Opens a Telegram link inside the Telegram app. The function expects passing a link in a full
 * format using the hostname "t.me".
 *
 * The Mini App will be closed.
 * @param url - URL to be opened.
 * @example
 * openTelegramLink('https://t.me/heyqbnk');
 */
export declare const openTelegramLinkFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(url: string | URL) => E.Either<OpenTelegramLinkError, void>, false, never>;
/**
 * @see openTelegramLinkFp
 */
export declare const openTelegramLink: import('../../with-checks/withChecksFp.js').WithChecks<(url: string | URL) => E.Either<OpenTelegramLinkError, void>, false, never>;
