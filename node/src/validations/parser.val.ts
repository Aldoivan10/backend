import {
    check,
    minValue,
    number,
    object,
    pipe,
    required,
    transform,
} from "valibot"
import { formatDecimals } from "../utils/number.util"

export const ParserSchema = pipe(
    required(
        object({
            id_unit: pipe(
                number("Campo requerido"),
                minValue(1, "El ID de la unidad debe ser mayor a 0")
            ),
            id_sub_unit: pipe(
                number("Campo requerido"),
                minValue(1, "El ID de la unidad debe ser mayor a 0")
            ),
            multiplier: pipe(
                number("Campo requerido"),
                transform(formatDecimals)
            ),
        }),
        "El ID de la unidad padre, ID de la unidad hija y el multiplicador son requeridos"
    ),
    check(
        (input) => input.id_unit !== input.id_sub_unit,
        "La unidad hija no puede ser la misma que la unidad padre"
    )
)
