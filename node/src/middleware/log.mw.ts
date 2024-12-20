import chalk from "chalk"
import { Request, Response } from "express"
import log4js from "log4js"

const datetime = chalk.yellow.bold("[%d{yyyy/MM/dd} %r]")
const client = chalk.blue.bold("[:user-agent -> :remote-addr - :remote-user]")
const request = chalk.green.bold('"HTTP/:http-version :method :url"')
const response = chalk.gray.bold(
    ":response-time ms - :res[content-length] bytes"
)
const coloredStatus = (res: Response) => {
    const status = res.statusCode
    const bg =
        status >= 500
            ? "bgRed"
            : status >= 400
            ? "bgYellow"
            : status >= 300
            ? "bgCyan"
            : "bgGreen"

    return chalk[bg].bold(` ${status} `)
}
const coloredErrors = (res: Response) => {
    const error = res.locals.error
    if (error) {
        const id = chalk.red.bold(`[${error.name}: ${error.id}]`)
        const details = error.details
            .map((detail) => {
                return (
                    chalk.red.bold(
                        `\t[${detail.location}${
                            detail.field ? ": " + detail.field : ""
                        }]`
                    ) +
                    chalk.yellow.bold(` ${detail.type}: `) +
                    chalk.gray.bold(detail.msg)
                )
            })
            .join("\n")
        const console = `\n${id} ${error.message}\n${details}`
        return console
    }
    return ""
}

log4js.configure({
    appenders: {
        file: {
            type: "dateFile",
            filename: "logs/erros.json",
            layout: {
                type: "pattern",
                pattern: '{ "%d{yyyy-MM-dd} %r": %m }',
            },
            keepFileExt: true, // Mantener la extensión del archivo
            pattern: "yyyy-MM", // Archivo por mes
            alwaysIncludePattern: true, // Incluir el patrón en todos los archivos
            numBackups: 2, // Número de copias de seguridad
        },
        console: {
            type: "console",
            layout: {
                type: "pattern",
                pattern: `${datetime} ${chalk.bold("%[[%p]%]")} %m`,
            },
        },
    },
    categories: {
        default: { appenders: ["console"], level: "info" },
        error: { appenders: ["file"], level: "error" },
    },
})

const fileLogger = log4js.getLogger("error")

const httpLogger = log4js.connectLogger(log4js.getLogger("default"), {
    level: "auto", // Ajusta automáticamente el nivel de log según el código de estado HTTP
    format: (req: Request, res: Response, format) => {
        if (req.path === "/favicon.ico") return "" // Ignorar peticiones a favicon

        const errors = coloredErrors(res)
        const status = coloredStatus(res)

        if (res.statusCode >= 400) {
            const details = res.locals.error?.details ?? []
            fileLogger.error(
                format(
                    JSON.stringify({
                        request: "HTTP/:http-version :method :url",
                        responseTime: ":response-time ms",
                        size: ":res[content-length] bytes",
                        status: ":status",
                        client: ":user-agent",
                        address: ":remote-addr",
                        user: ":remote-user",
                        details,
                    })
                )
            )
        }

        return format(`${client} ${request} ${status} ${response} ${errors}`)
    },
})

export const logMW = httpLogger
