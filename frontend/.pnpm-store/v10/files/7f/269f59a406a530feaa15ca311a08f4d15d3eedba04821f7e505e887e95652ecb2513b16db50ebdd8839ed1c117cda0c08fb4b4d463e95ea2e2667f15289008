import { RequestError } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { AccessDeniedError } from '../../errors.js';
import { AsyncOptions } from '../../types.js';
export type DownloadFileError = RequestError | AccessDeniedError;
/**
 * Displays a native popup prompting the user to download a file.
 * @param url - the HTTPS URL of the file to be downloaded.
 * @param file - the suggested name for the downloaded file.
 * @param options - additional request execution options.
 * @since Mini Apps v8.0
 * @example
 * fn.pipe(
 *   downloadFileFp('https://telegram.org/js/telegram-web-app.js', 'telegram-sdk.js'),
 *   TE.map(() => {
 *     console.log('Downloading');
 *   })
 * )
 */
export declare const downloadFileFp: import('../../with-checks/withChecksFp.js').WithChecksFp<(url: string, fileName: string, options?: AsyncOptions) => TE.TaskEither<DownloadFileError, void>, true, never>;
export declare const downloadFile: import('../../with-checks/withChecksFp.js').WithChecks<(url: string, fileName: string, options?: AsyncOptions) => TE.TaskEither<DownloadFileError, void>, true, never>;
