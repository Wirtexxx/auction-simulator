import { either as E } from 'fp-ts';
import { ValiError } from 'valibot';
import { InitDataGenSchema, InitDataGenType, LaunchParamsGenSchema, LaunchParamsGenType } from './structures.js';
export type ParseInitDataQueryError = ValiError<InitDataGenSchema>;
export type ParseLaunchParamsQueryError = ValiError<LaunchParamsGenSchema>;
export declare function parseInitDataQueryFp(value: string | URLSearchParams): E.Either<ParseInitDataQueryError, InitDataGenType>;
export declare function parseLaunchParamsQueryFp(value: string | URLSearchParams): E.Either<ParseLaunchParamsQueryError, LaunchParamsGenType>;
export declare const parseInitDataQuery: ((value: string | URLSearchParams) => {
    auth_date: Date;
    can_send_after?: number | undefined;
    chat?: ({
        id: number;
        photo_url?: string | undefined;
        type: string;
        title: string;
        username?: string | undefined;
    } & {
        [key: string]: unknown;
    }) | undefined;
    chat_type?: string | undefined;
    chat_instance?: string | undefined;
    hash: string;
    query_id?: string | undefined;
    receiver?: ({
        added_to_attachment_menu?: boolean | undefined;
        allows_write_to_pm?: boolean | undefined;
        first_name: string;
        id: number;
        is_bot?: boolean | undefined;
        is_premium?: boolean | undefined;
        last_name?: string | undefined;
        language_code?: string | undefined;
        photo_url?: string | undefined;
        username?: string | undefined;
    } & {
        [key: string]: unknown;
    }) | undefined;
    start_param?: string | undefined;
    signature: string;
    user?: ({
        added_to_attachment_menu?: boolean | undefined;
        allows_write_to_pm?: boolean | undefined;
        first_name: string;
        id: number;
        is_bot?: boolean | undefined;
        is_premium?: boolean | undefined;
        last_name?: string | undefined;
        language_code?: string | undefined;
        photo_url?: string | undefined;
        username?: string | undefined;
    } & {
        [key: string]: unknown;
    }) | undefined;
} & {
    [key: string]: unknown;
}) & {};
export declare const parseLaunchParamsQuery: ((value: string | URLSearchParams) => {
    tgWebAppBotInline?: boolean | undefined;
    tgWebAppData?: ({
        auth_date: Date;
        can_send_after?: number | undefined;
        chat?: ({
            id: number;
            photo_url?: string | undefined;
            type: string;
            title: string;
            username?: string | undefined;
        } & {
            [key: string]: unknown;
        }) | undefined;
        chat_type?: string | undefined;
        chat_instance?: string | undefined;
        hash: string;
        query_id?: string | undefined;
        receiver?: ({
            added_to_attachment_menu?: boolean | undefined;
            allows_write_to_pm?: boolean | undefined;
            first_name: string;
            id: number;
            is_bot?: boolean | undefined;
            is_premium?: boolean | undefined;
            last_name?: string | undefined;
            language_code?: string | undefined;
            photo_url?: string | undefined;
            username?: string | undefined;
        } & {
            [key: string]: unknown;
        }) | undefined;
        start_param?: string | undefined;
        signature: string;
        user?: ({
            added_to_attachment_menu?: boolean | undefined;
            allows_write_to_pm?: boolean | undefined;
            first_name: string;
            id: number;
            is_bot?: boolean | undefined;
            is_premium?: boolean | undefined;
            last_name?: string | undefined;
            language_code?: string | undefined;
            photo_url?: string | undefined;
            username?: string | undefined;
        } & {
            [key: string]: unknown;
        }) | undefined;
    } & {
        [key: string]: unknown;
    }) | undefined;
    tgWebAppDefaultColors?: {
        accent_text_color?: `#${string}` | undefined;
        bg_color?: `#${string}` | undefined;
        button_color?: `#${string}` | undefined;
        button_text_color?: `#${string}` | undefined;
        bottom_bar_bg_color?: `#${string}` | undefined;
        destructive_text_color?: `#${string}` | undefined;
        header_bg_color?: `#${string}` | undefined;
        hint_color?: `#${string}` | undefined;
        link_color?: `#${string}` | undefined;
        secondary_bg_color?: `#${string}` | undefined;
        section_bg_color?: `#${string}` | undefined;
        section_header_text_color?: `#${string}` | undefined;
        section_separator_color?: `#${string}` | undefined;
        subtitle_text_color?: `#${string}` | undefined;
        text_color?: `#${string}` | undefined;
    } | undefined;
    tgWebAppFullscreen?: boolean | undefined;
    tgWebAppPlatform: string;
    tgWebAppShowSettings?: boolean | undefined;
    tgWebAppStartParam?: string | undefined;
    tgWebAppThemeParams: {
        accent_text_color?: `#${string}` | undefined;
        bg_color?: `#${string}` | undefined;
        button_color?: `#${string}` | undefined;
        button_text_color?: `#${string}` | undefined;
        bottom_bar_bg_color?: `#${string}` | undefined;
        destructive_text_color?: `#${string}` | undefined;
        header_bg_color?: `#${string}` | undefined;
        hint_color?: `#${string}` | undefined;
        link_color?: `#${string}` | undefined;
        secondary_bg_color?: `#${string}` | undefined;
        section_bg_color?: `#${string}` | undefined;
        section_header_text_color?: `#${string}` | undefined;
        section_separator_color?: `#${string}` | undefined;
        subtitle_text_color?: `#${string}` | undefined;
        text_color?: `#${string}` | undefined;
    };
    tgWebAppVersion: string;
} & {
    [key: string]: unknown;
}) & {};
