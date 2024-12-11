import { Schema } from "express-validator"

export const KitVal: Schema = {
    name: {
        isString: {
            errorMessage: "El nombre deben ser carácteres",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El nombre es obligatorio",
        },
    },
    products: {
        isArray: {
            options: {
                min: 1,
            },
            errorMessage:
                "Los productos deben ser un arreglo de al menos 1 elemento",
        },
        custom: {
            options: (arr: KitProduct[]) => {
                const aux: Record<number, number> = {}
                for (const { id, unit } of arr) {
                    if (aux[id] === unit)
                        throw new Error(
                            "No se puede repetir la unidad de un mismo producto"
                        )
                    aux[id] = unit
                }
                return true
            },
        },
    },
    "products.*.id": {
        isInt: {
            options: { gt: 0 },
            errorMessage: "El ID del producto debe ser un número positivo",
        },
    },
    "products.*.unit": {
        isInt: {
            options: { gt: 0 },
            errorMessage: "El ID de la unidad debe ser un número positivo",
        },
    },
    "products.*.amount": {
        isInt: {
            options: { gt: 0 },
            errorMessage: "La cantidad debe ser un número positivo mayor a 0",
        },
    },
}
