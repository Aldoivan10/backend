import { object } from "valibot"
import { nameAttr } from "../utils/val.uti"

export default {
    code: object({
        name: nameAttr(128),
    }),
    entity_type: object({
        name: nameAttr(128),
    }),
    unit: object({
        name: nameAttr(32),
    }),
    department: object({
        name: nameAttr(128),
    }),
    user_type: object({
        name: nameAttr(32),
    }),
}
