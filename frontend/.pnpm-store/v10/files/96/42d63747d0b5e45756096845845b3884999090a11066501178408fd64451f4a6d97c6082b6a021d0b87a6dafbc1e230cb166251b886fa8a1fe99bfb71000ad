import { RequestError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { BetterPromise } from 'better-promises';
import { taskEither as TE } from 'fp-ts';
import { ConcurrentCallError, InvalidArgumentsError } from '../../errors.js';
import { ShowOptions } from './types.js';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithRequest } from '../../fn-options/withRequest.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { WithChecksFp, WithChecks } from '../../with-checks/withChecksFp.js';
export interface PopupOptions extends SharedFeatureOptions, WithVersion, WithRequest {
}
/**
 * @since Mini Apps v6.2
 */
export declare class Popup {
    constructor({ version, isTma, request }: PopupOptions);
    /**
     * Signal indicating if any popup is currently opened.
     */
    readonly isOpened: Computed<boolean>;
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * A method that shows a native popup described by the `params` argument.
     * The promise will be resolved when the popup is closed. Resolved value will have
     * an identifier of the pressed button.
     *
     * If a user clicked outside the popup or clicked the top right popup close
     * button, null will be resolved.
     *
     * @param options - popup parameters.
     * @since Mini Apps v6.2
     * @example
     * fn.pipe(
     *   popup.showFp({
     *     title: 'Confirm action',
     *     message: 'Do you really want to buy this burger?',
     *     buttons: [
     *       { id: 'yes', text: 'Yes' },
     *       { id: 'no', type: 'destructive', text: 'No' },
     *     ],
     *   }),
     *   TE.map(buttonId => {
     *     console.log('User clicked a button with ID', buttonId);
     *   }),
     * );
     */
    readonly showFp: WithChecksFp<(options: ShowOptions) => TE.TaskEither<RequestError | InvalidArgumentsError | ConcurrentCallError, string | undefined>, true>;
    /**
     * @see showFp
     */
    readonly show: WithChecks<(options: ShowOptions) => BetterPromise<string | undefined>, true>;
}
