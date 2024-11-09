import { Schema } from "express-validator"

export const name: Schema = {
    name: {
        isString: {
            errorMessage: "El nombre deben ser carácteres",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El nombre es obligatorio",
        },
        escape: true,
        isLength: {
            options: { max: 128 },
            errorMessage: "El nombre no debe exeder de 128 carácteres",
        },
    },
}
