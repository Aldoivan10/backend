import { Schema } from "express-validator"
import { nameAttr } from "../util/val.uti"

export const entityVal: Schema = {
    id_entity_type: {
        isInt: {
            options: { gt: 0 },
            errorMessage: "El ID de la entidad debe ser un positivo mayor a 0",
        },
    },
    rfc: {
        optional: true,
        isString: {
            errorMessage: "El RFC debe ser una cadena",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El RFC no puede ser un campo vacío",
        },
        isLength: {
            options: { min: 13, max: 13 },
            errorMessage: "El RFC debe ser exactamente 13 carácteres",
        },
    },
    name: nameAttr(128),
    address: {
        optional: true,
        isString: {
            errorMessage: "La dirección debe ser una cadena",
        },
        trim: true,
        notEmpty: {
            errorMessage: "La dirección no puede ser un campo vacío",
        },
        isLength: {
            options: { max: 128 },
            errorMessage: "La dirección no puede exceder 128 carácteres",
        },
    },
    domicile: {
        optional: true,
        isString: {
            errorMessage: "El domicilio debe ser una cadena",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El domicilio no puede ser un campo vacío",
        },
        isLength: {
            options: { max: 128 },
            errorMessage: "El domicilio no puede exceder 128 carácteres",
        },
    },
    postal_code: {
        optional: true,
        isString: {
            errorMessage: "El código postal deben ser una cadena",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El código postal no puede ser un campo vacío",
        },
        isLength: {
            options: { min: 5, max: 5 },
            errorMessage: "El código postal debe ser exactamente 5 carácteres",
        },
    },
    phone: {
        optional: true,
        isString: {
            errorMessage: "El número de teléfono deben ser una cadena",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El número de teléfono no puede ser un campo vacío",
        },
        isLength: {
            options: { min: 10, max: 10 },
            errorMessage:
                "El número de teléfono debe ser exactamente 10 carácteres",
        },
    },
    email: {
        optional: true,
        isEmail: {
            errorMessage: "El correo electrónico debe ser un correo válido",
        },
    },
}
