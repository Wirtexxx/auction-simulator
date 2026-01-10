import { BetterPromise, BetterPromiseOptions, TimeoutError } from 'better-promises';
import { taskEither as TE } from 'fp-ts';
import { Request2Error } from '../utils/request2.js';
export type isTMAError = Exclude<Request2Error, TimeoutError>;
/**
 * @see isTMAFp
 */
export declare function isTMA(): boolean;
/**
 * @see isTMAFp
 */
export declare function isTMA(type: 'complete', options?: BetterPromiseOptions): BetterPromise<boolean>;
/**
 * Returns true if the current environment is Telegram Mini Apps.
 *
 * It uses the `retrieveLaunchParams` function to determine if the environment
 * contains launch parameters. In case it does, true will be returned.
 *
 * In case you need stricter checks, use async override of this function.
 */
export declare function isTMAFp(): boolean;
/**
 * Returns promise with true if the current environment is Telegram Mini Apps.
 *
 * First of all, it checks if the current environment contains traits specific
 * to the Mini Apps environment. Then, it attempts to call a Mini Apps method
 * and waits for a response to be received.
 *
 * In case you need less strict checks, use sync override of this function.
 */
export declare function isTMAFp(type: 'complete', options?: BetterPromiseOptions): TE.TaskEither<isTMAError, boolean>;
