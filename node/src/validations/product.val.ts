import { Schema } from "express-validator"
import { nameAttr } from "./util"

export const productVal: Schema = {
    name: nameAttr(256),
    id_department: {
        isInt: {
            errorMessage: "El ID del departamento debe ser numérico",
        },
    },
    id_supplier: {
        isInt: {
            errorMessage: "El ID del proveedor debe ser numérico",
        },
    },
    amount: {
        isFloat: {
            options: { gt: 0 },
            errorMessage: "La cantidad debe ser númerica mayor a 0",
        },
    },
    buy: {
        isFloat: {
            options: { gt: 0 },
            errorMessage: "El precio de compra debe ser un número mayor a 0",
        },
    },
    min: {
        isFloat: {
            options: { gt: 0 },
            errorMessage: "La cantidad debe ser númerica mayor a 0",
        },
    },
    refundable: {
        optional: true,
        isBoolean: {
            errorMessage: "Reembolsable debe ser un booleano",
        },
    },
    codes: {
        isArray: {
            options: {
                min: 1,
            },
            errorMessage:
                "Los códigos deben ser un arreglo de al menos 1 elemento",
        },
        custom: {
            options: (arr: ProductCode[]) => {
                const ids = new Set(arr.map((item) => item.id))
                const codes = new Set(arr.map((item) => item.code))
                if (ids.size !== arr.length)
                    throw new Error(
                        "No puede haber más de un código por tipo de código"
                    )
                if (codes.size !== arr.length)
                    throw new Error("Los códigos deben ser únicos")
                return true
            },
        },
    },
    "codes.*.id": {
        isInt: {
            options: { gt: 0 },
            errorMessage: "El ID del código debe ser un número positivo",
        },
    },
    "codes.*.code": {
        isString: {
            errorMessage: "El código debe ser una cadena",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El código es obligatorio",
        },
    },
    units: {
        isArray: {
            options: {
                min: 1,
            },
            errorMessage:
                "Las ventas deben ser un arreglo de al menos 1 elemento",
        },
        custom: {
            options: (arr: ProductUnit[]) => {
                const ids = new Set(arr.map((item) => item.id))
                if (ids.size !== arr.length)
                    throw new Error("Las unidades deben ser únicas")
                return true
            },
        },
    },
    "units.0.profit": {
        isFloat: {
            options: { gt: 0 },
            errorMessage:
                "La ganancia debe ser un número mayor a 0 (Solo para el primer elemento).",
        },
    },
    "units.*.id": {
        isInt: {
            options: { gt: 0 },
            errorMessage: "El ID de la unidad debe ser un número positivo",
        },
    },
    "units.*.sale": {
        isFloat: {
            options: { gt: 0 },
            errorMessage: "El precio de venta debe ser un número mayor a 0",
        },
    },
}
