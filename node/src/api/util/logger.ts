import { ValidationError } from "express-validator"
import winston, { format, transports } from "winston"
import { APIError, ValError } from "./error"

const logger = winston.createLogger({
    transports: [
        new transports.File({ filename: "express.log" }),
        new transports.Console(),
    ],
    format: format.combine(format.timestamp(), format.json()),
})

export const getError = (err: Error, loc: string) => {
    return new APIError({
        name: err.name,
        message: "A ocurrido un error inesperado",
        error: {
            msg: err.message,
            location: loc,
            path: err.stack || "unknown",
        },
    })
}

export const getValError = (msg: string, errors: ValidationError[]) => {
    return new ValError({
        message: msg,
        errors,
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
