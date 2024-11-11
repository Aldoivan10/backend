import { ValidationError } from "express-validator"
import winston, { format, transports } from "winston"
import { APIError, ValError } from "./error"

const logger = winston.createLogger({
    transports: [new transports.File({ filename: "express.log" })],
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
        format.json()
    ),
})

export const getError = (err: Error, loc: string, status = 500) => {
    const { message, stack } = err
    let path = stack || "unknown"
    let msg = message

    if (message.startsWith("SQL")) {
        const data = message.split(":")
        path = data[0].trim()
        msg = data[1].trim()
    }

    return new APIError({
        message: "A ocurrido un error inesperado",
        error: {
            location: loc,
            path,
            msg,
        },
        status,
    })
}

export const getValError = (
    msg: string,
    errors: ValidationError[],
    status = 500
) => {
    return new ValError({
        message: msg,
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
