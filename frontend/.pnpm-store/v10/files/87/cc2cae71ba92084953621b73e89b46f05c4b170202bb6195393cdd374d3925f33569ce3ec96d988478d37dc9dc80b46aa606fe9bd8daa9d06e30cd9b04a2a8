import { PostEventError } from '@tma.js/bridge';
import { either as E } from 'fp-ts';
import { InvalidArgumentsError } from '../../errors.js';
export type SendDataError = PostEventError | InvalidArgumentsError;
/**
 * Sends data to the bot.
 *
 * When this method called, a service message sent to the bot containing the data of the length
 * up to 4096 bytes, and the Mini App closed.
 *
 * See the field `web_app_data` in the class [Message](https://core.telegram.org/bots/api#message).
 *
 * This method is only available for Mini Apps launched via a Keyboard button.
 * @param data - data to send to bot.
 */
export declare const sendDataFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(data: string) => E.Either<SendDataError, void>, false, never>;
/**
 * @see sendDataFp
 */
export declare const sendData: import('../../with-checks/withChecksFp.js').WithChecks<(data: string) => E.Either<SendDataError, void>, false, never>;
