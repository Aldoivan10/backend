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
} from "valibot"

export const BudgetSchema = intersect([
    required(
        object({
            items: pipe(
                array(
                    object({
                        id_product: pipe(
                            number("El ID del producto debe ser un número"),
                            minValue(1, "El valor mínimo es 1")
                        ),
                        id_unit: pipe(
                            number("El ID de la unidad debe ser un número"),
                            minValue(1, "El valor mínimo es 1")
                        ),
                        amount: pipe(
                            number("La cantidad debe ser un número"),
                            check(
                                (input) => input > 0,
                                "La cantidad debe ser mayor de 0"
                            )
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
