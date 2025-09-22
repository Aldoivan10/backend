import {
    array,
    length,
    minValue,
    nonEmpty,
    number,
    object,
    pipe,
    string,
    trim,
} from "valibot"

export const ShortcutSchema = object({
    shortcuts: pipe(
        array(
            object({
                shortcut: pipe(
                    string("Campo requerido"),
                    trim(),
                    nonEmpty("El atajo es obligatorio")
                ),
                id: pipe(
                    number("Campo requerido"),
                    minValue(1, "El ID es incorrecto")
                ),
            }),
            "Los atajos deben ser un arreglo"
        ),
        length(23, "El número de atajos es incorrecto")
    ),
})
