import { NextFunction, Request, Response } from "express"
import { APIError } from "../models/error"
import { getError } from "../utils/error.util"

export const errorMW = (
    err: APIError | Error,
    _: Request,
    res: Response,
    __: NextFunction
) => {
    const error = err instanceof APIError ? err : getError(err)
    res.locals.error = error
    res.status(error.status).json({
        id: error.id,
        code: error.code,
        message: error.message,
        details: error.details || [],
    })
}
