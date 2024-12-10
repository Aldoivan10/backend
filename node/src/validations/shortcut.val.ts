import { Schema } from "express-validator"

export const shortcutVal: Schema = {
    shortcuts: {
        isArray: {
            options: {
                min: 23,
                max: 23,
            },
            errorMessage: "Los atajos deben ser un arreglo",
        },
    },
    "shortcuts.*.shortcut": {
        isString: {
            errorMessage: "El atajo debe ser una cadena",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El atajo es obligatorio",
        },
    },
    "shortcuts.*.id": {
        isInt: {
            errorMessage: "El ID del atajo no es correcto",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El ID del atajo es obligatorio",
        },
    },
}
