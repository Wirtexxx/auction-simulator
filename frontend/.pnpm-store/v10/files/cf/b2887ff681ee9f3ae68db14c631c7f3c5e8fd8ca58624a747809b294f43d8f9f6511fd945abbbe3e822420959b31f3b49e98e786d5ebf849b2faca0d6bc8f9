import { PostEventError } from '@tma.js/bridge';
import { either as E } from 'fp-ts';
export interface ShareStoryOptions {
    /**
     * The caption to be added to the media.
     * 0-200 characters for regular users and 0-2048 characters for premium subscribers.
     * @see https://telegram.org/faq_premium#telegram-premium
     */
    text?: string;
    /**
     * An object that describes a widget link to be included in the story.
     * Note that only premium subscribers can post stories with links.
     * @see https://telegram.org/faq_premium#telegram-premium
     */
    widgetLink?: {
        /**
         * The URL to be included in the story.
         */
        url: string;
        /**
         * The name to be displayed for the widget link, 0-48 characters.
         */
        name?: string;
    };
}
export type ShareStoryError = PostEventError;
/**
 * Opens the native story editor.
 * @since Mini Apps v7.8
 * @example
 * fn.pipe(
 *   shareStory('https://example.com/background.png', {
 *     text: 'Look at this cool group!',
 *     widgetLink: {
 *       url: 'https://t.me/heyqbnk',
 *       name: 'Vlad\'s community',
 *     },
 *   }),
 *   TE.match(error => {
 *     console.error('Something went wrong', error);
 *   }, () => {
 *     console.log('Call was successful');
 *   }),
 * );
 */
export declare const shareStoryFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(mediaUrl: string, options?: ShareStoryOptions) => E.Either<ShareStoryError, void>, true, never>;
/**
 * @see shareStoryFp
 */
export declare const shareStory: import('../../with-checks/withChecksFp.js').WithChecks<(mediaUrl: string, options?: ShareStoryOptions) => E.Either<ShareStoryError, void>, true, never>;
