import { NextFunction, Request, Response } from "express"
import { APIError } from "../util/error"
import * as Logger from "../util/logger"

export const errorMW = (
    err: APIError | Error,
    _: Request,
    res: Response,
    next: NextFunction
) => {
    Logger.error(err)
    res.locals.error = err
    next()
}
