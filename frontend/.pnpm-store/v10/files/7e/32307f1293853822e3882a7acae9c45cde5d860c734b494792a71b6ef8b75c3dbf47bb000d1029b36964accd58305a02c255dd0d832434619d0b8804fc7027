import { PostEventError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { BetterTaskEitherError } from '@tma.js/toolkit';
import { BetterPromise } from 'better-promises';
import { either as E, taskEither as TE } from 'fp-ts';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithPostEvent } from '../../fn-options/withPostEvent.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { AsyncOptions } from '../../types.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
export interface QrScannerOptions extends WithVersion, WithPostEvent, SharedFeatureOptions {
    /**
     * A function to add a listener to the event determining if the QR scanner
     * was closed.
     * @param listener - a listener to add.
     * @returns A function to remove the listener.
     */
    onClosed: (listener: VoidFunction) => VoidFunction;
    /**
     * A function to add a listener to the event containing a scanned QR content.
     * @param listener - a listener to add.
     * @returns A function to remove the listener.
     */
    onTextReceived: (listener: (data: string) => void) => VoidFunction;
}
interface SharedOptions extends AsyncOptions {
    /**
     * Title to be displayed in the scanner.
     */
    text?: string;
}
interface CaptureOptions extends SharedOptions {
    /**
     * @returns True if the passed QR code should be captured.
     * @param qr - scanned QR content.
     */
    capture: (qr: string) => boolean;
}
interface OpenOptions extends SharedOptions {
    /**
     * Function which will be called if a QR code was scanned.
     * @param qr - scanned QR content.
     */
    onCaptured: (qr: string) => void;
}
/**
 * @since Mini Apps v6.4
 */
export declare class QrScanner {
    constructor({ version, onClosed, onTextReceived, isTma, postEvent, }: QrScannerOptions);
    /**
     * Signal indicating if the scanner is currently opened.
     */
    readonly isOpened: Computed<boolean>;
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * Opens the scanner and returns a task which will be completed with the QR content if the
     * passed `capture` function returned true.
     *
     * Task may also be completed with undefined if the scanner was closed.
     * @param options - method options.
     * @returns A promise with QR content presented as string or undefined if the scanner was closed.
     * @since Mini Apps v6.4
     * @example
     * fn.pipe(
     *   qrScanner.captureFp({
     *     capture(scannedQr) {
     *       return scannedQr === 'any expected by me qr';
     *     }
     *   }),
     *   TE.match(
     *     error => {
     *       console.error(error);
     *     },
     *     qr => {
     *       console.log('My QR:'), qr;
     *     }
     *   ),
     * );
     */
    readonly captureFp: WithChecksFp<(options: CaptureOptions) => (TE.TaskEither<PostEventError | BetterTaskEitherError, string | undefined>), true>;
    /**
     * @see captureFp
     */
    readonly capture: WithChecks<(options: CaptureOptions) => BetterPromise<string | undefined>, true>;
    /**
     * Closes the scanner.
     * @since Mini Apps v6.4
     */
    readonly closeFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;
    /**
     * @see close
     */
    readonly close: WithChecks<() => void, true>;
    /**
     * Opens the scanner and returns a task which will be completed when the scanner was closed.
     * @param options - method options.
     * @since Mini Apps v6.4
     * @example Without `capture` option
     * if (qrScanner.open.isAvailable()) {
     *   const qr = await qrScanner.open({ text: 'Scan any QR' });
     * }
     * @example
     * fn.pipe(
     *   qrScanner.openFp({
     *     onCaptured(scannedQr) {
     *       if (scannedQr === 'any expected by me qr') {
     *         qrScanner.close();
     *       }
     *     }
     *   }),
     *   TE.match(
     *     error => {
     *       console.error(error);
     *     },
     *     () => {
     *       console.log('The scanner was closed');
     *     }
     *   ),
     * );
     */
    readonly openFp: WithChecksFp<(options: OpenOptions) => TE.TaskEither<PostEventError, void>, true>;
    /**
     * @see openFp
     */
    readonly open: WithChecks<(options: OpenOptions) => BetterPromise<void>, true>;
}
export {};
