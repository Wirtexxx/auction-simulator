import { CustomMethodParams, CustomMethodName, InvokeCustomMethodError, InvokeCustomMethodFpOptions, RequestError } from '@tma.js/bridge';
import type * as TE from 'fp-ts/TaskEither';
export type { InvokeCustomMethodError };
export interface InvokeCustomMethodNoRequestIdFn {
    <M extends CustomMethodName>(this: void, method: M, params: CustomMethodParams<M>, options?: InvokeCustomMethodFpOptions): TE.TaskEither<InvokeCustomMethodError, unknown>;
    (this: void, method: string, params: object, options?: InvokeCustomMethodFpOptions): TE.TaskEither<RequestError, unknown>;
}
export interface WithInvokeCustomMethod {
    invokeCustomMethod: InvokeCustomMethodNoRequestIdFn;
}
export declare const withInvokeCustomMethod: <O extends object>(obj: O) => O & WithInvokeCustomMethod;
