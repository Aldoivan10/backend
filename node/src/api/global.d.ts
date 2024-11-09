import { Schema, ValidationError } from "express-validator"
import DB from "../model/db"

declare global {
    namespace Express {
        interface Locals {
            db: DB
        }
    }

    type ErrorItem = {
        msg: string
        value?: any
        type?: string
        path: string
        location: string
    }

    type APIErrorArgs = {
        name?: string
        status?: number
        message: string
        error?: ErrorItem
        errors?: ValidationError[]
    }

    type ValMWArgs = { schema: Schema; item?: string }

    type TableID = { id: number }
}

export {}
