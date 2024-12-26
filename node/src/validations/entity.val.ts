import {
    digits,
    email,
    length,
    maxLength,
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
    union,
} from "valibot"
import { nameAttr } from "../utils/val.uti"

export const EntitySchema = required(
    object({
        id_entity_type: pipe(
            number("El tipo de indentidad debe ser un número"),
            minValue(1, "El tipo de entidad debe ser mayor a 0")
        ),
        rfc: nullish(
            pipe(
                string("El RFC debe ser una cadena"),
                trim(),
                nonEmpty("El RFC no debe estar vacío"),
                length(13, "El RFC debe ser de exáctamente 13 crácteres")
            ),
            null
        ),
        name: nameAttr(128),
        address: nullish(
            pipe(
                string("La dirección debe ser una cadena"),
                trim(),
                nonEmpty("La dirección no debe estar vacío"),
                maxLength(128, "La dirección no debe exceder 128 carácteres")
            ),
            null
        ),
        domicile: nullish(
            pipe(
                string("El domicilio debe ser una cadena"),
                trim(),
                nonEmpty("El domicilio no debe estar vacío"),
                maxLength(128, "El domicilio no debe exceder 128 carácteres")
            ),
            null
        ),
        postal_code: nullish(
            union([
                pipe(
                    string("El código postal debe ser una cadena"),
                    trim(),
                    nonEmpty("El código postal no debe estar vacío"),
                    digits("El código postal debe ser un número de 5 dígitos"),
                    length(
                        5,
                        "El código postal debe ser de exactamente 5 dígitos"
                    )
                ),
                pipe(
                    number("El código postal debe ser un número de 5 dígitos"),
                    transform((n) => n.toString()),
                    trim(),
                    nonEmpty("El código postal no debe estar vacío"),
                    digits("El código postal debe ser un número de 5 dígitos"),
                    length(
                        5,
                        "El código postal debe ser de exactamente 5 dígitos"
                    )
                ),
            ]),
            null
        ),
        phone: nullish(
            union([
                pipe(
                    string("El teléfono debe ser una cadena"),
                    trim(),
                    nonEmpty("El teléfono no debe estar vacío"),
                    digits("El teléfono debe ser un número de 10 dígitos"),
                    length(10, "El teléfono debe ser de exactamente 10 dígitos")
                ),
                pipe(
                    number("El teléfono debe ser un número de 10 dígitos"),
                    transform((n) => n.toString()),
                    trim(),
                    nonEmpty("El teléfono no debe estar vacío"),
                    digits("El teléfono debe ser un número de 10 dígitos"),
                    length(10, "El teléfono debe ser de exactamente 10 dígitos")
                ),
            ]),
            null
        ),
        email: nullish(
            pipe(
                string("El correo debe ser una cadena"),
                trim(),
                nonEmpty("El correo no debe estar vacío"),
                email("El correo no es válido"),
                maxLength(64, "El correo no debe exceder 64 carácteres")
            ),
            null
        ),
    }),
    ["id_entity_type", "name"],
    "El nombre y el tipo de entidad son obligatorios"
)
