import { Schema } from "express-validator"
import { nameAttr } from "./util"

export const userVal: Schema = {
    name: nameAttr(64),
    password: {
        optional: true,
        isString: {
            errorMessage: "La contraseña debe ser una cadena",
        },
        trim: true,
        notEmpty: {
            errorMessage: "La contraseña no puede ser un campo vacío",
        },
        isLength: {
            options: { min: 3, max: 10 },
            errorMessage: "La contraseña debe ser de 3 a 8 carácteres",
        },
    },
    id_user_type: {
        isInt: {
            errorMessage: "El ID del usuario debe ser un número entero",
        },
    },
}
