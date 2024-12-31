import {
    array,
    boolean,
    check,
    InferOutput,
    intersect,
    minLength,
    minValue,
    nonEmpty,
    nullish,
    number,
    object,
    pipe,
    required,
    string,
    transform,
    trim,
} from "valibot"
import { formatDecimals } from "../utils/number.util"
import { NameSchema } from "./general.val"

export const ProductSchema = intersect([
    NameSchema(256),
    required(
        object({
            id_department: pipe(
                number(`El ID del departamento debe ser numérico`),
                minValue(1, `El ID debe ser mayor a 0`)
            ),
        }),
        `El departamento es obligatorio`
    ),
    required(
        object({
            id_supplier: pipe(
                number(`El ID del proveedor debe ser numérico`),
                minValue(1, `El ID debe ser mayor a 0`)
            ),
        }),
        `El proveedor es obligatorio`
    ),
    required(
        object({
            amount: nullish(
                pipe(
                    number("La cantidad de producto debe ser un número"),
                    minValue(0, "La cantidad mínima de producto es 0"),
                    transform(formatDecimals)
                ),
                0
            ),
            min: nullish(
                pipe(
                    number("La cantidad mínima debe ser un número"),
                    minValue(
                        0,
                        "La cantidad mínima debe ser igual o mayor que 0"
                    ),
                    transform(formatDecimals)
                ),
                0
            ),
            refundable: nullish(
                boolean("Reembolsable debe ser un booleano"),
                false
            ),
            buy: pipe(
                number("El precio de compra debe ser un número"),
                minValue(0, "El precio de compra mínimo es 0"),
                transform(formatDecimals)
            ),
        }),
        ["buy"],
        "El precio de comprar es requerido"
    ),
    required(
        object({
            codes: pipe(
                array(
                    object({
                        id: pipe(
                            number("El ID del código debe ser un número"),
                            minValue(1, "El ID del código debe ser mayor a 0")
                        ),
                        code: pipe(
                            string("El código debe ser una cadena"),
                            trim(),
                            nonEmpty("El código no puede estar vacío")
                        ),
                    })
                ),
                minLength(1, "Debe haber al menos un código"),
                check((arr) => {
                    const ids = arr.map((item) => item.id)
                    const set = new Set(ids)
                    return ids.length === set.size
                }, "No se pueden repetir los códigos")
            ),
        }),
        "Los códigos son requeridos"
    ),
    required(
        object({
            units: pipe(
                array(
                    object({
                        id: pipe(
                            number("El ID de la unidad debe ser un número"),
                            minValue(1, "El ID de la unidad debe ser mayor a 0")
                        ),
                        sale: pipe(
                            number("El precio de venta debe ser un número"),
                            minValue(0, "El precio de venta mínimo es 0"),
                            transform(formatDecimals)
                        ),
                        profit: nullish(
                            pipe(
                                number(
                                    "La ganacia de la unidad debe ser un número (para la primer unidad)"
                                ),
                                minValue(
                                    0,
                                    "La ganancia de la unidad mínima es 0 (para la primer unidad)"
                                ),
                                transform(formatDecimals)
                            ),
                            null
                        ),
                    })
                ),
                minLength(1, "Debe haber al menos una unidad"),
                check((arr) => {
                    const ids = arr.map((item) => item.id)
                    const set = new Set(ids)
                    return ids.length === set.size
                }, "No se pueden repetir las unidades"),
                check(
                    (arr) => arr[0]?.profit !== null,
                    "La ganancia es requerida para la primer unidad"
                )
            ),
        }),
        "Las unidades son requeridas"
    ),
])

export type ProductBody = InferOutput<typeof ProductSchema>
