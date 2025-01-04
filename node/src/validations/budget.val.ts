import { check, minValue, number, object, pipe, required } from "valibot"

export const BudgetSchema = required(
    object({
        product: pipe(
            number("El ID del producto debe ser un número"),
            minValue(1, "El valor mínimo es 1")
        ),
        unit: pipe(
            number("El ID de la unidad debe ser un número"),
            minValue(1, "El valor mínimo es 1")
        ),
        amount: pipe(
            number("La cantidad debe ser un número"),
            check((input) => input > 0, "La cantidad debe ser mayor de 0")
        ),
    }),
    "El producto, unidad y cantidad son requeridos"
)
