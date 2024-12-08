import { Schema } from "express-validator"
import { nameAttr } from "../util/val.uti"

export default {
    code: {
        name: nameAttr(128),
    },
    entity_type: {
        name: nameAttr(128),
    },
    unit: {
        name: nameAttr(32),
    },
    department: {
        name: nameAttr(128),
    },
    user_type: {
        name: nameAttr(32),
    },
} as Record<string, Schema>
