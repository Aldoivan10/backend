import { BaseSchema, InferInput, InferIssue } from "valibot"
import { NameSchema } from "./general.val"

export const CatalogSchemas: Record<
    string,
    BaseSchema<any, any, InferIssue<any>>
> = {
    code: NameSchema(128),
    entity_type: NameSchema(128),
    unit: NameSchema(32),
    department: NameSchema(128),
    user_type: NameSchema(32),
}

export type CatalogType = InferInput<(typeof CatalogSchemas)["code"]>
