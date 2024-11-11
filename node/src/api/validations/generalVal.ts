import { Schema } from "express-validator"

export const ids: Schema = {
    ids: {
        custom: {
            options: (arr: any) => {
                if (!Array.isArray(arr))
                    throw new Error("Los IDs deben ser una lista de números")
                if (arr.length === 0)
                    throw new Error("Debe existir al menos 1 elemento")
                if (!arr.every(Number.isInteger))
                    throw new Error(
                        "Todos los elementos deben ser números enteros"
                    )
                if (!arr.every((num) => num > 0))
                    throw new Error(
                        "Todos los elementos deben ser números positivos"
                    )
                return true
            },
        },
    },
}
