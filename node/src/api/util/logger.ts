import { ValidationError } from "express-validator"
import winston, { format, transports } from "winston"
import { APIError, ValError } from "./error"

const logger = winston.createLogger({
    transports: [new transports.File({ filename: "express.json" })],
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
        format.json({ space: 4 })
    ),
})

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

export const error = (error: APIError | Error, errors: Object[] = []) => {
    if (error instanceof APIError) logger.error(error)
    else {
        const { message, name, stack } = error as Error
        logger.error({
            message,
            name,
            stack,
            errors,
        })
    }
}
