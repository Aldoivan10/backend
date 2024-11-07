import winston, { format, transports } from "winston"

const logger = winston.createLogger({
    transports: [
        new transports.File({ filename: "express.log" }),
        new transports.Console(),
    ],
    format: format.combine(format.timestamp(), format.json()),
})

export const error = ({ message, name, stack }: Error) => {
    logger.error({
        message,
        name,
        stack,
    })
}
