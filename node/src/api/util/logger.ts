import winston, { format, transports } from "winston"
import { APIError } from "./error"

const logger = winston.createLogger({
    transports: [
        new transports.File({ filename: "express.log" }),
        new transports.Console(),
    ],
    format: format.combine(format.timestamp(), format.json()),
})

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
