import { InvoiceStatus, RequestError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { BetterPromise } from 'better-promises';
import { taskEither as TE } from 'fp-ts';
import { ConcurrentCallError, InvalidArgumentsError } from '../../errors.js';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithRequest } from '../../fn-options/withRequest.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { AsyncOptions } from '../../types.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
type InvoiceTask<E, T> = TE.TaskEither<RequestError | ConcurrentCallError | E, T>;
export interface InvoiceOptions extends WithVersion, WithRequest, SharedFeatureOptions {
}
/**
 * @since Mini Apps v6.1
 */
export declare class Invoice {
    constructor({ version, request, isTma }: InvoiceOptions);
    /**
     * Signal indicating if any invoice is currently opened.
     */
    readonly isOpened: Computed<boolean>;
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * Opens an invoice using its slug or URL.
     * @param slug - invoice slug.
     * @param options - additional options.
     * @since Mini Apps v6.1
     * @example
     * const status = await invoice.openSlug('kJNFS331');
     */
    readonly openSlugFp: WithChecksFp<(slug: string, options?: AsyncOptions) => InvoiceTask<never, InvoiceStatus>, true>;
    /**
     * @see openSlugFp
     */
    readonly openSlug: WithChecks<(slug: string, options?: AsyncOptions) => BetterPromise<InvoiceStatus>, true>;
    /**
     * Opens an invoice using its URL.
     * @param url - invoice URL.
     * @param options - additional options.
     * @since Mini Apps v6.1
     * @example
     * const status = await invoice.openUrl('https://t.me/$kJNFS331');
     */
    readonly openUrlFp: WithChecksFp<(url: string, options?: AsyncOptions) => (InvoiceTask<InvalidArgumentsError, InvoiceStatus>), true>;
    /**
     * @see openUrlFp
     */
    readonly openUrl: WithChecks<(url: string, options?: AsyncOptions) => BetterPromise<InvoiceStatus>, true>;
}
export {};
