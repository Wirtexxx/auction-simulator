import { KnownThemeParamsKey, RGB } from '@tma.js/types';
import { CheckAction, InferOutput, NumberSchema, RecordSchema, SchemaWithPipe, StringSchema, TransformAction, UnionSchema } from 'valibot';
export type InitDataGenSchema = ReturnType<typeof initData>;
export type InitDataGenType = InferOutput<InitDataGenSchema>;
export type LaunchParamsGenSchema = ReturnType<typeof launchParams>;
export type LaunchParamsGenType = InferOutput<LaunchParamsGenSchema>;
export type MiniAppsMessageGenSchema = ReturnType<typeof miniAppsMessage>;
export type MiniAppsMessageGenType = InferOutput<MiniAppsMessageGenSchema>;
export declare function initDataChat(): import('valibot').LooseObjectSchema<{
    id: NumberSchema<undefined>;
    photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    type: StringSchema<undefined>;
    title: StringSchema<undefined>;
    username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
}, undefined>;
export declare function initDataUser(): import('valibot').LooseObjectSchema<{
    added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
    allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
    first_name: StringSchema<undefined>;
    id: NumberSchema<undefined>;
    is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
    is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
    last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
}, undefined>;
export declare function initData(): import('valibot').LooseObjectSchema<{
    auth_date: SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, Date>, import('valibot').DateSchema<undefined>]>;
    can_send_after: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<any, number>, import('valibot').IntegerAction<number, undefined>]>, undefined>;
    chat: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
        id: NumberSchema<undefined>;
        photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        type: StringSchema<undefined>;
        title: StringSchema<undefined>;
        username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    }, undefined>>, undefined>;
    chat_type: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    chat_instance: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    hash: StringSchema<undefined>;
    query_id: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    receiver: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
        added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        first_name: StringSchema<undefined>;
        id: NumberSchema<undefined>;
        is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    }, undefined>>, undefined>;
    start_param: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    signature: StringSchema<undefined>;
    user: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
        added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        first_name: StringSchema<undefined>;
        id: NumberSchema<undefined>;
        is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    }, undefined>>, undefined>;
}, undefined>;
export declare function initDataQuery(): import('./pipes.js').QueryToSchemaPipe<import('valibot').LooseObjectSchema<{
    auth_date: SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, Date>, import('valibot').DateSchema<undefined>]>;
    can_send_after: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<any, number>, import('valibot').IntegerAction<number, undefined>]>, undefined>;
    chat: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
        id: NumberSchema<undefined>;
        photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        type: StringSchema<undefined>;
        title: StringSchema<undefined>;
        username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    }, undefined>>, undefined>;
    chat_type: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    chat_instance: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    hash: StringSchema<undefined>;
    query_id: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    receiver: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
        added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        first_name: StringSchema<undefined>;
        id: NumberSchema<undefined>;
        is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    }, undefined>>, undefined>;
    start_param: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    signature: StringSchema<undefined>;
    user: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
        added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        first_name: StringSchema<undefined>;
        id: NumberSchema<undefined>;
        is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
        last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    }, undefined>>, undefined>;
}, undefined>>;
export declare function themeParams(): RecordSchema<SchemaWithPipe<[StringSchema<undefined>, TransformAction<string, KnownThemeParamsKey>]>, SchemaWithPipe<[UnionSchema<[StringSchema<undefined>, NumberSchema<undefined>], any>, TransformAction<string | number, string>, CheckAction<RGB, undefined>]>, undefined>;
export declare function launchParams(): import('valibot').LooseObjectSchema<{
    tgWebAppBotInline: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, boolean>]>, undefined>;
    tgWebAppData: import('valibot').OptionalSchema<import('./pipes.js').QueryToSchemaPipe<import('valibot').LooseObjectSchema<{
        auth_date: SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, Date>, import('valibot').DateSchema<undefined>]>;
        can_send_after: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<any, number>, import('valibot').IntegerAction<number, undefined>]>, undefined>;
        chat: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
            id: NumberSchema<undefined>;
            photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            type: StringSchema<undefined>;
            title: StringSchema<undefined>;
            username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        }, undefined>>, undefined>;
        chat_type: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        chat_instance: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        hash: StringSchema<undefined>;
        query_id: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        receiver: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
            added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            first_name: StringSchema<undefined>;
            id: NumberSchema<undefined>;
            is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        }, undefined>>, undefined>;
        start_param: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        signature: StringSchema<undefined>;
        user: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
            added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            first_name: StringSchema<undefined>;
            id: NumberSchema<undefined>;
            is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        }, undefined>>, undefined>;
    }, undefined>>, undefined>;
    tgWebAppDefaultColors: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<RecordSchema<SchemaWithPipe<[StringSchema<undefined>, TransformAction<string, KnownThemeParamsKey>]>, SchemaWithPipe<[UnionSchema<[StringSchema<undefined>, NumberSchema<undefined>], any>, TransformAction<string | number, string>, CheckAction<`#${string}`, undefined>]>, undefined>>, undefined>;
    tgWebAppFullscreen: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, boolean>]>, undefined>;
    tgWebAppPlatform: StringSchema<undefined>;
    tgWebAppShowSettings: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, boolean>]>, undefined>;
    tgWebAppStartParam: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    tgWebAppThemeParams: import('./pipes.js').JsonToSchemaPipe<RecordSchema<SchemaWithPipe<[StringSchema<undefined>, TransformAction<string, KnownThemeParamsKey>]>, SchemaWithPipe<[UnionSchema<[StringSchema<undefined>, NumberSchema<undefined>], any>, TransformAction<string | number, string>, CheckAction<`#${string}`, undefined>]>, undefined>>;
    tgWebAppVersion: StringSchema<undefined>;
}, undefined>;
export declare function launchParamsQuery(): import('./pipes.js').QueryToSchemaPipe<import('valibot').LooseObjectSchema<{
    tgWebAppBotInline: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, boolean>]>, undefined>;
    tgWebAppData: import('valibot').OptionalSchema<import('./pipes.js').QueryToSchemaPipe<import('valibot').LooseObjectSchema<{
        auth_date: SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, Date>, import('valibot').DateSchema<undefined>]>;
        can_send_after: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<any, number>, import('valibot').IntegerAction<number, undefined>]>, undefined>;
        chat: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
            id: NumberSchema<undefined>;
            photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            type: StringSchema<undefined>;
            title: StringSchema<undefined>;
            username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        }, undefined>>, undefined>;
        chat_type: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        chat_instance: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        hash: StringSchema<undefined>;
        query_id: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        receiver: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
            added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            first_name: StringSchema<undefined>;
            id: NumberSchema<undefined>;
            is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        }, undefined>>, undefined>;
        start_param: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        signature: StringSchema<undefined>;
        user: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<import('valibot').LooseObjectSchema<{
            added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            first_name: StringSchema<undefined>;
            id: NumberSchema<undefined>;
            is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            last_name: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            language_code: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            photo_url: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
            username: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
        }, undefined>>, undefined>;
    }, undefined>>, undefined>;
    tgWebAppDefaultColors: import('valibot').OptionalSchema<import('./pipes.js').JsonToSchemaPipe<RecordSchema<SchemaWithPipe<[StringSchema<undefined>, TransformAction<string, KnownThemeParamsKey>]>, SchemaWithPipe<[UnionSchema<[StringSchema<undefined>, NumberSchema<undefined>], any>, TransformAction<string | number, string>, CheckAction<`#${string}`, undefined>]>, undefined>>, undefined>;
    tgWebAppFullscreen: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, boolean>]>, undefined>;
    tgWebAppPlatform: StringSchema<undefined>;
    tgWebAppShowSettings: import('valibot').OptionalSchema<SchemaWithPipe<readonly [StringSchema<undefined>, TransformAction<string, boolean>]>, undefined>;
    tgWebAppStartParam: import('valibot').OptionalSchema<StringSchema<undefined>, undefined>;
    tgWebAppThemeParams: import('./pipes.js').JsonToSchemaPipe<RecordSchema<SchemaWithPipe<[StringSchema<undefined>, TransformAction<string, KnownThemeParamsKey>]>, SchemaWithPipe<[UnionSchema<[StringSchema<undefined>, NumberSchema<undefined>], any>, TransformAction<string | number, string>, CheckAction<`#${string}`, undefined>]>, undefined>>;
    tgWebAppVersion: StringSchema<undefined>;
}, undefined>>;
/**
 * @returns True if the passed value contains valid launch parameters query.
 */
export declare function isLaunchParamsQuery(value: string | URLSearchParams): boolean;
export declare function miniAppsMessage(): import('valibot').LooseObjectSchema<{
    readonly eventType: StringSchema<undefined>;
    readonly eventData: import('valibot').OptionalSchema<import('valibot').UnknownSchema, undefined>;
}, undefined>;
