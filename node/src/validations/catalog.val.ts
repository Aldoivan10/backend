import { NameSchema } from "./general.val"

export default {
    code: NameSchema(128),
    entity_type: NameSchema(128),
    unit: NameSchema(32),
    department: NameSchema(128),
    user_type: NameSchema(32),
}
