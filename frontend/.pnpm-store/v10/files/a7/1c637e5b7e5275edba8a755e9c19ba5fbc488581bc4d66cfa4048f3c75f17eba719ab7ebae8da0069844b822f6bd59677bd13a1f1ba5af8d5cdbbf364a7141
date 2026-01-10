import { BaseIssue, BaseSchema, CheckAction, InferOutput, InstanceSchema, SchemaWithPipe, StringSchema, TransformAction, UnionSchema } from 'valibot';
type RequiredSchema = BaseSchema<any, any, BaseIssue<any>>;
export type TransformJsonToSchemaAction<Schema extends RequiredSchema> = SchemaWithPipe<readonly [
    StringSchema<any>,
    CheckAction<string, string>,
    TransformAction<string, unknown>,
    Schema
]>;
export type TransformQueryToSchemaAction<Schema extends RequiredSchema> = SchemaWithPipe<readonly [
    UnionSchema<[
        StringSchema<undefined>,
        InstanceSchema<typeof URLSearchParams, undefined>
    ], undefined>,
    CheckAction<string | URLSearchParams, string>,
    TransformAction<string | URLSearchParams, InferOutput<Schema>>
]>;
export declare function transformQueryToSchema<Schema extends RequiredSchema>(schema: Schema): TransformQueryToSchemaAction<Schema>;
/**
 * @returns A transformer applying `JSON.parse` to the input.
 */
export declare function transformJsonToSchema<Schema extends RequiredSchema>(schema: Schema): TransformJsonToSchemaAction<Schema>;
export {};
