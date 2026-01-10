import { OpenLinkBrowser, PostEventError } from '@tma.js/bridge';
import { either as E } from 'fp-ts';
import { InvalidArgumentsError } from '../../errors.js';
export interface OpenLinkOptions {
    /**
     * Attempts to use the instant view mode.
     */
    tryInstantView?: boolean;
    /**
     * A preferred browser to open the link in.
     */
    tryBrowser?: OpenLinkBrowser;
}
export type OpenLinkError = PostEventError | InvalidArgumentsError;
/**
 * Opens a link.
 *
 * The Mini App will not be closed.
 *
 * Note that this method can be called only in response to the user
 * interaction with the Mini App interface (e.g. click inside the Mini App or on the main button).
 * @param url - URL to be opened.
 * @param options - additional options.
 * @example
 * openLink('https://google.com', {
 *   tryInstantView: true,
 *   tryBrowser: 'chrome',
 * });
 */
export declare const openLinkFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(url: string | URL, options?: OpenLinkOptions) => E.Either<OpenLinkError, void>, false, never>;
export declare const openLink: import('../../with-checks/withChecksFp.js').WithChecks<(url: string | URL, options?: OpenLinkOptions) => E.Either<OpenLinkError, void>, false, never>;
