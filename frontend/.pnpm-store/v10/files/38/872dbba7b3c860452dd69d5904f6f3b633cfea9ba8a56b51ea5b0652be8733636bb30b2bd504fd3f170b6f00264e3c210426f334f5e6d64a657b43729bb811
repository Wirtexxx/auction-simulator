import { BaseIssue, BaseSchema, InstanceSchema, SchemaWithPipe, StringSchema, UnionSchema } from 'valibot';
import { TransformJsonToSchemaAction, TransformQueryToSchemaAction } from './transformers.js';
type RequiredSchema = BaseSchema<any, any, BaseIssue<any>>;
export type JsonToSchemaPipe<Schema extends RequiredSchema> = SchemaWithPipe<readonly [
    StringSchema<undefined>,
    TransformJsonToSchemaAction<Schema>
]>;
export type QueryToSchemaPipe<Schema extends RequiredSchema> = SchemaWithPipe<readonly [
    UnionSchema<[
        StringSchema<undefined>,
        InstanceSchema<typeof URLSearchParams, undefined>
    ], undefined>,
    TransformQueryToSchemaAction<Schema>
]>;
export declare function pipeJsonToSchema<Schema extends RequiredSchema>(schema: Schema): JsonToSchemaPipe<Schema>;
export declare function pipeQueryToSchema<Schema extends RequiredSchema>(schema: Schema): QueryToSchemaPipe<Schema>;
export {};
