import {
    intersect,
    nonEmpty,
    object,
    pipe,
    required,
    string,
    trim,
} from "valibot"

export const LoginSchema = required(
    object({
        username: pipe(
            string("El nombre debe ser una cadena"),
            trim(),
            nonEmpty("El nombre no debe estar vacío")
        ),
    }),
    "El usuario es obligatorio"
)

export const AdminSchema = intersect([
    LoginSchema,
    required(
        object({
            password: pipe(
                string("La contraseña es obligatoria"),
                trim(),
                nonEmpty("La contraseña no debe estar vacía")
            ),
        }),
        "La contraseña es obligatoria"
    ),
])
