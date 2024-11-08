import { NextFunction, Request, Response } from "express"
import { checkSchema, validationResult } from "express-validator"
import { ValError } from "../util/error"
import { getValError } from "../util/logger"

export const validationMW = ({ schema, item }: ValMWArgs): any[] => {
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
