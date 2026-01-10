import { PostEventError } from '@tma.js/bridge';
import { either as E } from 'fp-ts';
export type ShareURLError = PostEventError;
/**
 * Shares the specified URL with the passed to the chats, selected by user.
 * After being called, it closes the mini application.
 *
 * This method uses Telegram's Share Links.
 * @param url - URL to share.
 * @param text - text to append after the URL.
 * @see https://core.telegram.org/api/links#share-links
 * @see https://core.telegram.org/widgets/share#custom-buttons
 */
export declare const shareURLFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(url: string, text?: string) => E.Either<ShareURLError, void>, false, never>;
/**
 * @see shareURLFp
 */
export declare const shareURL: import('../../with-checks/withChecksFp.js').WithChecks<(url: string, text?: string) => E.Either<ShareURLError, void>, false, never>;
