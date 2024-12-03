import { NextFunction, Request, Response } from "express"
import { APIError } from "../model/error"
import { getError } from "../util/error"

export const errorMW = (
    err: APIError | Error,
    _: Request,
    res: Response,
    __: NextFunction
) => {
    const error = err instanceof APIError ? err : getError(err)
    res.locals.error = error
    res.status(error.status).json({
        message: error.message,
        errors: error.errors || [],
    })
}