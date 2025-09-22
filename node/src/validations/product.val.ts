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
    record,
    string,
    transform,
    trim
} from "valibot"
import { formatDecimals } from "../utils/number.util"
import { NameSchema } from "./general.val"
import { MESSAGES } from "./messages"

export const ProductSchema = intersect([
    NameSchema(256),
    object({
        codes: pipe(
            record(
                pipe(
                    string(),
                    transform(id => +id),
                    number(MESSAGES.REQUIRED_FIELD("ID")),
                    minValue(1, MESSAGES.MIN_ONE)
                ),
                pipe(
                    string(MESSAGES.REQUIRED_FIELD("código")),
                    trim(),
                    nonEmpty(MESSAGES.REQUIRED_FIELD("código"))
                ), MESSAGES.AT_LEAST_FIELD("un código")),
            check((obj) => {
                const ids = Object.values(obj)
                return Boolean(ids.length)
            }, MESSAGES.AT_LEAST_FIELD("un código")),
            check((obj) => {
                const ids = Object.values(obj)
                const set = new Set(ids)
                return ids.length === set.size
            }, "No se pueden repetir los códigos")
        ),
        id_department: pipe(
            number(MESSAGES.UNKNOWN_FIELD("Departamento")),
            minValue(1, MESSAGES.MIN_ONE)
        ),
        id_supplier: pipe(
            number(MESSAGES.UNKNOWN_FIELD("Proveedor")),
            minValue(1, MESSAGES.MIN_ONE)
        ),
        amount: pipe(
            number(MESSAGES.REQUIRED_FIELD("La cantidad")),
            minValue(0, MESSAGES.MIN_ZERO),
            transform(formatDecimals)
        ),
        min: pipe(
            number(MESSAGES.REQUIRED_FIELD("La cantidad mínima")),
            minValue(0, MESSAGES.MIN_ZERO),
            transform(formatDecimals)
        ),
        refundable: boolean(MESSAGES.REQUIRED_FIELD("El campo reembolsable")),
        buy: pipe(
            number(MESSAGES.REQUIRED_FIELD("El precio de compra debe ser un número")),
            minValue(0, MESSAGES.MIN_ZERO),
            transform(formatDecimals)
        ),
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
])

export type ProductBody = InferOutput<typeof ProductSchema>
