import { NextFunction, Request, Response } from "express"
import { checkSchema, Schema, validationResult } from "express-validator"
import { ValError } from "../model/error"

export const validationMW = (arg: Schema | Function): any[] => {
    return [
        arg instanceof Function ? arg : checkSchema(arg),
        (req: Request, _: Response, next: NextFunction) => {
            const errors = validationResult(req)
            if (!errors.isEmpty())
                next(new ValError({ errors: errors.array() }))
            else next()
        },
    ]
}
