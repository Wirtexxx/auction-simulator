/**
 * Message log level.
 */
export type LogLevel = 'log' | 'error' | 'warn';
export interface LoggerOptions {
    bgColor?: string;
    textColor?: string;
    /**
     * True if logs are enabled.
     * @default true
     */
    shouldLog?: boolean | (() => boolean);
}
export type LoggerFn = (...args: any[]) => void;
export type LoggerForceFn = (...args: any[]) => void;
export interface Logger {
    /**
     * Prints an error message into the console.
     * @param args - items to log.
     */
    error: LoggerFn;
    /**
     * Prints an error message into the console ignoring the `shouldLog`
     * constructor option.
     * @param args - items to log.
     */
    forceError: LoggerForceFn;
    /**
     * Prints a log message into the console ignoring the `shouldLog` constructor
     * option.
     * @param args - items to log.
     */
    forceLog: LoggerForceFn;
    /**
     * Prints a warning message into the console ignoring the `shouldLog`
     * constructor option.
     * @param args - items to log.
     */
    forceWarn: LoggerForceFn;
    /**
     * Prints a log message into the console.
     * @param args - items to log.
     */
    log: LoggerFn;
    /**
     * Prints a warning message into the console.
     * @param args - items to log.
     */
    warn: LoggerFn;
}
export declare function createLogger(scope: string, options?: LoggerOptions): Logger;
