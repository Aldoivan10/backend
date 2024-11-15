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
    if (error)
        return (
            "\n" +
            error.errors
                .map((err) => {
                    return (
                        chalk.red.bold(`[${err.location ?? err.type}]`) +
                        chalk.yellow.bold(` ${err.path}: `) +
                        chalk.gray.bold(err.msg)
                    )
                })
                .join("\n")
        )
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
            keepFileExt: true,
            pattern: "yyyy-MM",
            alwaysIncludePattern: true,
            numBackups: 2,
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
log4js.recording

const httpLogger = log4js.connectLogger(log4js.getLogger("default"), {
    level: "auto", // Ajusta automáticamente el nivel de log según el código de estado HTTP
    format: (_: Request, res: Response, format) => {
        const errors = coloredErrors(res)
        const status = coloredStatus(res)

        if (res.statusCode >= 400) {
            const errors = res.locals.error?.errors ?? []
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
                        errors,
                    })
                )
            )
        }

        return format(`${client} ${request} ${status} ${response} ${errors}`)
    },
})

export const logMW = httpLogger
