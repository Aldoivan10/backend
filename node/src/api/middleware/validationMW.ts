import { NextFunction, Request, Response } from "express"
import { checkSchema, Schema, validationResult } from "express-validator"
import { ValError } from "../util/error"
import { getValError } from "../util/logger"

export const validationMW = (arg: Schema | Function): any[] => {
    return [
        arg instanceof Function ? arg : checkSchema(arg),
        (req: Request, _: Response, next: NextFunction) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const msg = ValError.ERRVAL
                next(getValError(msg, errors.array(), 422))
            } else next()
        },
    ]
}
