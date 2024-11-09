import { NextFunction, Request, Response } from "express"
import { APIError } from "../util/errors"
import { error } from "../util/logger"

export const errorHandler = (
    err: APIError | Error,
    _: Request,
    res: Response,
    __: NextFunction
) => {
    error(err)
    const status = err instanceof APIError ? err.status : 500
    res.status(status).json({
        message: err.message,
        errors: err instanceof APIError ? err.errors : undefined,
    })
}
