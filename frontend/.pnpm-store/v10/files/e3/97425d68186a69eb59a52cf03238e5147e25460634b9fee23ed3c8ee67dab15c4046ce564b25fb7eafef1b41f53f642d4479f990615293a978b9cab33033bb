import { BetterPromise, BetterPromiseExecutorContext, BetterPromiseOptions, TimeoutError } from 'better-promises';
import { either as E, taskEither as TE } from 'fp-ts';
import { AnyFn } from './types/misc.js';
export type AnyEither<L = any, R = any> = E.Either<L, R> | TE.TaskEither<L, R>;
export type AnyFnAnyEither<L = any, R = any> = (...args: any) => AnyEither<L, R>;
export type RightOfEither<T extends AnyEither> = [T] extends [E.Either<any, infer U>] ? U : T extends TE.TaskEither<any, infer U> ? U : never;
export type LeftOfEither<T extends AnyEither> = [T] extends [E.Either<infer U, any>] ? U : T extends TE.TaskEither<infer U, any> ? U : never;
export type RightOfReturn<F extends AnyFnAnyEither> = RightOfEither<ReturnType<F>>;
export type LeftOfReturn<F extends AnyFnAnyEither> = LeftOfEither<ReturnType<F>>;
export type MaybeMonadToCommon<T> = [T] extends [E.Either<any, infer U>] ? U : T extends TE.TaskEither<any, infer U> ? BetterPromise<U> : T;
export type MaybeCommonToMonad<T> = T extends AnyEither ? T : T extends PromiseLike<infer U> ? TE.TaskEither<unknown, U> : E.Either<unknown, T>;
export type MaybeMonadReturnTypeToCommon<Fn extends AnyFn> = MaybeMonadToCommon<ReturnType<Fn>>;
export type MaybeCommonReturnTypeToMonad<Fn extends AnyFn> = MaybeCommonToMonad<ReturnType<Fn>>;
export declare function throwifyAnyEither<E extends AnyEither>(either: E): MaybeMonadToCommon<E>;
export declare function throwifyFpFn<Fn extends AnyFnAnyEither>(fn: Fn): (((...args: Parameters<Fn>) => MaybeMonadReturnTypeToCommon<Fn>) & {
    [K in keyof Fn]: Fn[K];
});
export type BetterTaskEitherError = TimeoutError;
export declare const BetterTaskEither: (<E, T>(executor: (resolve: (data: T) => void, reject: (reason: E) => void, context: BetterPromiseExecutorContext<E.Either<E | BetterTaskEitherError, T>>) => (void | Promise<void>), options?: BetterPromiseOptions) => TE.TaskEither<E | BetterTaskEitherError, T>) & {
    fn: <E, T>(fn_: (context: BetterPromiseExecutorContext<E.Either<E | BetterTaskEitherError, T>>) => (E.Either<E, T> | TE.TaskEither<E, T>), options?: BetterPromiseOptions) => TE.TaskEither<E | BetterTaskEitherError, T>;
};
