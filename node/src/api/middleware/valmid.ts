import { NextFunction, Request, Response } from "express"
import { checkSchema, validationResult } from "express-validator"
import { ValError } from "../util/errors"
import { getValError } from "../util/logger"

export const validationHandler = ({ schema, item }: ValMidArgs): any[] => {
    return [
        checkSchema(schema),
        (req: Request, _: Response, next: NextFunction) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const msg = item ? ValError.ERRCREATE(item) : ValError.ERRVAL
                next(getValError(msg, errors.array(), 422))
            } else {
                next()
            }
        },
    ]
}
