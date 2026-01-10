import { LaunchParamsGenType, ParseLaunchParamsQueryError } from '@tma.js/transformers';
import { either as E, option as O } from 'fp-ts';
import { LaunchParamsRetrieveError } from './errors.js';
export type RetrieveRawInitDataError = RetrieveRawLaunchParamsError;
export type RetrieveRawLaunchParamsError = LaunchParamsRetrieveError;
export type RetrieveLaunchParamsError = RetrieveRawLaunchParamsError | ParseLaunchParamsQueryError;
export type RetrieveLaunchParamsResult = LaunchParamsGenType;
/**
 * @returns Launch parameters from any known source.
 */
export declare function retrieveLaunchParamsFp(): E.Either<RetrieveLaunchParamsError, RetrieveLaunchParamsResult>;
/**
 * @see retrieveLaunchParamsFp
 */
export declare const retrieveLaunchParams: () => RetrieveLaunchParamsResult;
/**
 * @returns Raw init data from any known source.
 */
export declare function retrieveRawInitDataFp(): E.Either<RetrieveRawInitDataError, O.Option<string>>;
/**
 * @see retrieveRawInitDataFp
 */
export declare function retrieveRawInitData(): string | undefined;
/**
 * @returns Launch parameters in a raw format from any known source.
 */
export declare function retrieveRawLaunchParamsFp(): E.Either<RetrieveRawLaunchParamsError, string>;
/**
 * @see retrieveRawLaunchParamsFp
 */
export declare const retrieveRawLaunchParams: (() => string) & {};
