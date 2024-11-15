import { ValidationError } from "express-validator"
import { APIError, ValError } from "./error"

export const getError = (err: Error, request: string, status = 500) => {
    const { message, stack } = err
    let path = stack || "unknown"
    let location = "unknown"
    let msg = message

    if (message.startsWith("SQL")) {
        const [name, ...data] = message.split(": ")
        path = name
        msg = data.join(": ")
        location = "database"
    }

    return new APIError({
        message: "A ocurrido un error inesperado",
        error: {
            location,
            path,
            msg,
        },
        status,
        request,
    })
}

export const getValError = (
    msg: string,
    request: string,
    errors: ValidationError[],
    status = 500
) => {
    return new ValError({
        message: msg,
        request,
        errors,
        status,
    })
}
