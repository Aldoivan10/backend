import {
    array,
    check,
    intersect,
    maxLength,
    minLength,
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

export const SaleSchema = intersect([
    pipe(
        object({
            discount: nullish(
                pipe(
                    number("El descuento debe ser un número"),
                    check((num) => num > 0, "El descuento debe ser mayor a 0"),
                    transform(formatDecimals)
                ),
                null
            ),
            new_total: nullish(
                pipe(
                    number("El nuevo total debe ser un número"),
                    check(
                        (num) => num > 0,
                        "El nuevo total debe ser mayor a 0"
                    ),
                    transform(formatDecimals)
                ),
                null
            ),
        }),
        check((obj) => {
            if (obj.discount) return Boolean(obj.new_total)
            if (obj.new_total) return false
            return true
        }, "Si hay descuento debe haber un nuevo total y viceversa")
    ),
    required(
        object({
            total: pipe(
                number("El total debe ser un número"),
                check((total) => total > 0, "El total debe ser mayor a 0")
            ),
            entity: pipe(
                string("La entidad debe ser una cadena"),
                trim(),
                nonEmpty("La entidad no debe estar vacía"),
                maxLength(
                    128,
                    "El nombre de la entidad no debe ser mayor a 128 carácteres"
                )
            ),
            items: pipe(
                array(
                    object({
                        product: pipe(
                            string(
                                "El nombre del producto debe ser una cadena"
                            ),
                            trim(),
                            nonEmpty(
                                "El nombre del producto no puede estar vacío"
                            ),
                            maxLength(
                                512,
                                "El nombre del producto no puede exceder los 512 crácteres"
                            )
                        ),
                        unit: pipe(
                            string(
                                "El nombre de la unidad debe ser una cadena"
                            ),
                            trim(),
                            nonEmpty(
                                "EL nombre de la unidad no puede estar vacío"
                            ),
                            maxLength(
                                32,
                                "El nombre de la unidad no debe exceder los 64 carácteres"
                            )
                        ),
                        amount: pipe(
                            number("La cantidad vendida debe ser un número"),
                            check(
                                (amount) => amount > 0,
                                "La cantidad debe ser mayor a 0"
                            )
                        ),
                        sale: pipe(
                            number("El precio de venta debe ser un número"),
                            check(
                                (sale) => sale > 0,
                                "El precio de venta debe ser mayor a 0"
                            )
                        ),
                        new_sale: nullish(
                            pipe(
                                number(
                                    "El nuevo precio de venta debe ser un número"
                                ),
                                check(
                                    (sale) => sale > 0,
                                    "El nuevo precio de venta debe ser mayor a 0"
                                )
                            ),
                            null
                        ),
                    }),
                    "Los produtos deben ser un arreglo"
                ),
                minLength(1, "Al menos debe contener 1 producto")
            ),
        }),
        "El total, la entidad y los productos son requerido"
    ),
])
