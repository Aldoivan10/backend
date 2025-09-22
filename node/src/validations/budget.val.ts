import {
    array,
    check,
    intersect,
    minLength,
    minValue,
    number,
    object,
    pipe,
    required,
    transform,
} from "valibot"
import { formatDecimals } from "../utils/number.util"

export const BudgetSchema = intersect([
    required(
        object({
            items: pipe(
                array(
                    object({
                        id_product: pipe(
                            number("Campo requerido"),
                            minValue(1, "El valor mínimo es 1")
                        ),
                        id_unit: pipe(
                            number("Campo requerido"),
                            minValue(1, "El valor mínimo es 1")
                        ),
                        amount: pipe(
                            number("Campo requerido"),
                            check(
                                (input) => input > 0,
                                "La cantidad debe ser mayor de 0"
                            ),
                            transform(formatDecimals)
                        ),
                    })
                ),
                minLength(1, "Al menos debe existir 1 elemento")
            ),
        }),
        "Los productos son requeridos"
    ),
    object({
        id_entity: pipe(
            number("El ID de la entidad debe ser un número"),
            minValue(1, "El de la entidad debe ser mayor que 0")
        ),
    }),
])
