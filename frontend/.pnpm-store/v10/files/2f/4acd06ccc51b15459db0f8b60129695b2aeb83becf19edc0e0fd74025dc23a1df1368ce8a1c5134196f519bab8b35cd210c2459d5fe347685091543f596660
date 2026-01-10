import { PostEventError, SwitchInlineQueryChatType } from '@tma.js/bridge';
import { either as E } from 'fp-ts';
export type SwitchInlineQueryError = PostEventError;
/**
 * Inserts the bot's username and the specified inline query in the current chat's input field.
 * Query may be empty, in which case only the bot's username will be inserted. The client prompts
 * the user to choose a specific chat, then opens that chat and inserts the bot's username and
 * the specified inline query in the input field.
 * @param query - text which should be inserted in the input after the current bot name. Max
 * length is 256 symbols.
 * @param chatTypes - List of chat types which could be chosen to send the message. Could be an
 * empty list.
 * @since Mini Apps v6.7
 * @example
 * fn.pipe(
 *   switchInlineQuery('my query goes here', ['users']),
 *   E.match(error => {
 *     console.error('Something went wrong', error);
 *   }, () => {
 *     console.log('Call was successful');
 *   }),
 * );
 */
export declare const switchInlineQueryFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(query: string, chatTypes?: SwitchInlineQueryChatType[]) => E.Either<SwitchInlineQueryError, void>, true, never>;
/**
 * @see switchInlineQueryFp
 */
export declare const switchInlineQuery: import('../../with-checks/withChecksFp.js').WithChecks<(query: string, chatTypes?: SwitchInlineQueryChatType[]) => E.Either<SwitchInlineQueryError, void>, true, never>;
