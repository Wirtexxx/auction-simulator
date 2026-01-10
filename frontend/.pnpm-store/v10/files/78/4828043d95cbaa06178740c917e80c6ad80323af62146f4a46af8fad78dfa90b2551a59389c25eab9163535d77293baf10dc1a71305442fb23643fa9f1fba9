import { RGB } from '@tma.js/types';
import { either as E } from 'fp-ts';
/**
 * @returns True if the value has the #RGB format.
 */
export declare const isRGBShort: (value: string) => value is RGB;
/**
 * @returns True if the value has the #RGBA format.
 */
export declare const isRGBAShort: (value: string) => value is RGB;
/**
 * @returns True if the value has the #RRGGBB format.
 */
export declare const isRGB: (value: string) => value is RGB;
/**
 * @returns True if the value has the #RRGGBBAA format.
 */
export declare const isRGBA: (value: string) => value is RGB;
/**
 * @returns True if the value has any known RGB format.
 * @param value - value to check.
 */
export declare function isAnyRGB(value: string): value is RGB;
/**
 * Converts passed value to #RRGGBBAA format. Accepts the following color formats:
 * - `#RGB`
 * - `#RGBA`
 * - `#RRGGBB`
 * - `#RRGGBBAA`
 * - `rgb(1,2,3)`
 * - `rgba(1,2,3,4)`
 * @param value - a value to convert.
 * @returns A value in the #RRGGBBAA format.
 */
export declare function toRGBFullFp(value: string): E.Either<Error, RGB>;
/**
 * Converts passed value to #RRGGBB format. Accepts the following color formats:
 * - `#RGB`
 * - `#RGBA`
 * - `#RRGGBB`
 * - `#RRGGBBAA`
 * - `rgb(1,2,3)`
 * - `rgba(1,2,3,4)`
 * @param value - a value to convert.
 * @returns A value in the #RRGGBB format.
 * @deprecated This function cuts the RGB's alpha channel. Use the `toRGBFullFp` function instead.
 */
export declare function toRGBFp(value: string): E.Either<Error, RGB>;
/**
 * @see toRGBFp
 * @deprecated This function cuts the RGB's alpha channel. Use the `toRGBFull` function instead.
 */
export declare const toRGB: ((value: string) => `#${string}`) & {};
/**
 * @see toRGBFullFp
 */
export declare const toRGBFull: ((value: string) => `#${string}`) & {};
