import {
    array,
    check,
    isoDateTime,
    maxLength,
    maxValue,
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

export const IdsSchema = object({
    ids: pipe(
        array(
            pipe(
                number("Campo requerido"),
                minValue(1, "Los ids deben ser enteros positivos")
            ),
            "Los ids deben estar en un arreglo"
        ),
        minLength(1, "Debe existir al menos 1 elemento")
    ),
})

export const NameSchema = (max: number) => {
    return required(
        object({
            name: pipe(
                string("Campo requerido"),
                trim(),
                nonEmpty("El nombre es obligatorio"),
                maxLength(max, `El nombre no debe exceder ${max} carácteres`)
            ),
        }),
        "El nombre es obligatorio"
    )
}

export const DateRangeSchema = pipe(
    required(
        object({
            init: pipe(
                string(
                    "Fecha inválida"
                ),
                isoDateTime(
                    "La fecha no esta en el formato solicitado (yyyy-mm-dd)"
                ),
                transform((date) => new Date(date)),
                maxValue(new Date(), "La fecha máxima es el día actual")
            ),
            end: nullish(
                pipe(
                    string(
                        "Fecha inválida"
                    ),
                    isoDateTime(
                        "La fecha no esta en el formato solicitado (yyyy-mm-dd)"
                    ),
                    transform((date) => new Date(date)),
                    maxValue(new Date(), "La fecha máxima es el día actual")
                ),
                null
            ),
        }),
        "La fecha de inicio es requerida"
    ),
    check((dates) => {
        const { init, end } = dates
        return end ? init < end : true
    }, "La fecha de inicio debe ser anterior a la fecha final"),
    transform((dates) => {
        const { init, end } = dates
        const [strInit] = init.toISOString().split("T")
        const [strEnd] = end ? end.toISOString().split("T") : [null]
        return { init: strInit, end: strEnd }
    })
)
