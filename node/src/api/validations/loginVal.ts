import { Schema } from "express-validator"

export const loginVal: Schema = {
    name: {
        isString: {
            errorMessage: "El nombre deben ser carácteres",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El nombre es obligatorio",
        },
    },
    password: {
        isString: {
            errorMessage: "La contraseña es obligatoria",
        },
        trim: true,
        notEmpty: {
            errorMessage: "La contraseña no puede ser un campo vacío",
        },
    },
}
