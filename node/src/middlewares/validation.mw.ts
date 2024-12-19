import { NextFunction, Request, Response } from "express"
import { checkSchema, Schema, validationResult } from "express-validator"
import { ValidError } from "../models/error"

export const validationMW = (arg: Schema | Function): any[] => {
    return [
        arg instanceof Function ? arg : checkSchema(arg),
        (req: Request, _: Response, next: NextFunction) => {
            const errors = validationResult(req)
            if (!errors.isEmpty())
                throw ValidError.fromExpress(errors.array() as any)
            next()
        },
    ]
}
