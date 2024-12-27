import { NextFunction, Request, Response } from "express"
import { BaseSchema, InferIssue, parse, ValiError } from "valibot"
import { ValidError } from "../models/error"

export const validationMW = <S extends BaseSchema<any, any, InferIssue<any>>>(
    schema: S | ((req: Request) => S)
) => {
    return (req: Request, _: Response, next: NextFunction) => {
        try {
            const validator =
                typeof schema === "function" ? schema(req) : schema
            const body = parse(validator, req.body)
            req.body = body
            next()
        } catch (error) {
            if (error instanceof ValiError) next(ValidError.fromValibot(error))
            else next(error)
        }
    }
}
