import { NextFunction, Request, Response } from "express"
import { APIError } from "../util/error"
import * as Logger from "../util/logger"

export const errorMW = (
    err: APIError | Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const error =
        err instanceof APIError
            ? err
            : Logger.getError(err, `${req.method} ${req.url}`)
    Logger.error(error)
    res.locals.error = error
    res.status(error.status).json({
        message: error.message,
        errors: error.errors || [],
    })
    next()
}
