import chalk from "chalk"
import { Request, Response } from "express"
import morgan from "morgan"

morgan.token("colored-status", (_: Request, res: Response) => {
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
})

morgan.token("datetime", () => {
    return chalk.yellow.bold(new Date().toLocaleString())
})

const dateTime = chalk.yellow.bold(":datetime")
const client = chalk.blue.bold("[:user-agent -> :remote-addr - :remote-user]")
const request = chalk.green.bold('":method :url HTTP/:http-version"')
const response = chalk.gray.bold(":res[content-length] b - :response-time ms")

export const logMW = morgan(
    `${dateTime} ${client} ${request} :colored-status ${response} `
)
