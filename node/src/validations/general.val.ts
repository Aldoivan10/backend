import {
    array,
    maxLength,
    minLength,
    minValue,
    nonEmpty,
    number,
    object,
    pipe,
    required,
    string,
    trim,
} from "valibot"

export const IdsSchema = object({
    ids: pipe(
        array(
            pipe(
                number("Los ids deben ser números"),
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
                string("El nombre debe ser una cadena"),
                trim(),
                nonEmpty("El nombre no debe estar vacío"),
                maxLength(max, `El nombre no debe exceder ${max} carácteres`)
            ),
        }),
        "El nombre es obligatorio"
    )
}
