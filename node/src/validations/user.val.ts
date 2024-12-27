import {
    intersect,
    maxLength,
    minLength,
    minValue,
    nonEmpty,
    nullish,
    number,
    object,
    partialCheck,
    pipe,
    required,
    string,
    trim,
} from "valibot"
import { NameSchema } from "./general.val"

export const UserSchema = pipe(
    intersect([
        NameSchema(64),
        required(
            object({
                password: nullish(
                    pipe(
                        string("La contraseña debe ser una cadena"),
                        trim(),
                        nonEmpty("La contraseña no debe estar vacía"),
                        minLength(
                            3,
                            "La contraseña debe de ser de al menos 3 carácteres"
                        ),
                        maxLength(
                            10,
                            "La contraseña no debe exceder 10 carácteres"
                        )
                    ),
                    null
                ),
                id_user_type: pipe(
                    number("El ID de tipo de usuario debe ser un número"),
                    minValue(
                        1,
                        "El ID de tipo de usuario debe ser un número positivo"
                    )
                ),
            }),
            "El tipo de usuario es obligatorio"
        ),
    ]),
    partialCheck(
        [["id_user_type"], ["password"]],
        (input) => input.id_user_type === 1 && Boolean(input.password),
        "Este tipo de usuario requiere contraseña"
    )
)
