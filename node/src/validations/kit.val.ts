import {
    array,
    check,
    checkItems,
    InferOutput,
    intersect,
    minLength,
    minValue,
    number,
    object,
    pipe,
    required,
} from "valibot"
import { NameSchema } from "./general.val"

export const KitSchema = intersect([
    NameSchema(64),
    required(
        object({
            products: pipe(
                array(
                    object({
                        id: pipe(
                            number("Campo requerido"),
                            minValue(1, "El ID del producto debe ser mayor a 0")
                        ),
                        unit: pipe(
                            number("Campo requerido"),
                            minValue(1, "El ID de la unidad debe ser mayor a 0")
                        ),
                        amount: pipe(
                            number("Campo requerido"),
                            check(
                                (value) => value > 0,
                                "La cantidad debe ser mayor a 0"
                            )
                        ),
                    })
                ),
                minLength(1, "Debe haber al menos un producto"),
                checkItems((item, index, array) => {
                    const items = array.filter(
                        (i) => i.id === item.id && i.unit === item.unit
                    )
                    return items.length === 1
                }, "No se puede repetir la unidad en un mismo producto")
            ),
        }),
        "Los productos son obligatorios"
    ),
])

export type KitBody = InferOutput<typeof KitSchema>
