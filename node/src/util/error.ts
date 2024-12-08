import { JOSEError } from "jose/errors"
import { APIError, AuthError, ValidError } from "../model/error"

export const getError = (err: Error, status = 500) => {
    const { message, name } = err

    if (message.includes("not valid JSON")) return ValidError.unprocessed()
    if (err instanceof JOSEError) return AuthError.fromJWT(err)

    return new APIError({
        message: "A ocurrido un error inesperado",
        status,
        details: [
            {
                location: "internal",
                field: null,
                type: name,
                msg: message,
            },
        ],
    })
}
