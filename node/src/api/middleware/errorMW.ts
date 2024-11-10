import { NextFunction, Request, Response } from "express"
import { APIError } from "../util/error"
import * as Logger from "../util/logger"

export const errorMW = (
    err: APIError,
    _: Request,
    res: Response,
    next: NextFunction
) => {
    Logger.error(err)
    res.locals.error = err
    res.status(err.status).json({
        message: err.message,
        errors: err.errors || [],
    })
    next()
}
