import { ValidationError } from "express-validator"
import DB from "../model/db"

declare global {
    namespace Express {
        interface Locals {
            db: DB
        }
    }

    type APIErr = {
        msg: string
        value?: any
        type?: string
        path: string
        location: string
    }

    type APIErrConstructor = {
        name?: string
        error?: APIErr
        status?: number
        message: string
        errors?: ValidationError[]
    }

    type TableID = { id: number }
}

export {}
