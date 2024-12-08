import { ValidationError } from "express-validator"
import { APIError } from "./model/error"

declare global {
    namespace Express {
        interface Locals {
            error?: APIError
            user?: UserToken
        }
    }

    type Env = {
        PORT?: number
        HOST?: string
        PASS_SALT?: number
        TK_KEY?: string
        AT_TIME?: string
        RT_TIME?: string
        DB_PATH?: string
        TK_ALG?: string
        TK_OPT?: Obj
    }

    type Maybe<T> = T | undefined | null

    /* DATABASE */

    type Filters = { limit?: number; offset?: number; filter?: string }

    type RepoArgs = {
        columns: string[]
        order?: string
        filter?: string
    }

    type ID = { id: number }

    /* ERRORS */

    type ErrorDetail = {
        msg: string
        type: string
        location: string
        field: string | null
    }

    type APIErrorArgs = {
        code?: string
        status?: number
        message: string
        details: ErrorDetail[]
    }

    type ValidationErrorArgs = Omit<APIErrorArgs, "message"> & {
        status?: 400 | 422
    }

    type ExpressValidationError = ValidationError & {
        param?: string
        location?: string
    }

    type SQLError = Error & Required<Pick<APIErrorArgs, "message" | "code">>

    /* MODEL */

    type Obj = Record<string, any>

    type CatalogItem = ID & { name: string }

    type Entity = CatalogItem & {
        id_entity_type: number
        rfc?: string
        address?: string
        domicile?: string
        postal_code?: string
        phone?: string
        email?: string
    }

    type ProductUnit = ID & { sale: number; profit: Maybe<number> }

    type ProductUnits = [ProductUnit, ...Omit<ProductUnit, "profit">[]]

    type ProductCode = ID & { code: string; id_product: number }

    type Product = CatalogItem & {
        codes: Omit<ProductCode, "id_product">[]
        refundable: boolean | number
        department: CatalogItem
        supplier: CatalogItem
        units: ProductUnit[]
        amount: number
        buy: number
        min: number
    }

    type User = CatalogItem & { role: CatalogItem; password: Maybe<string> }

    type UserToken = Omit<LoginBody, "password"> & {
        logged: boolean
        role: string
    }

    /* REPOSITORIES */

    type EntityBody = Omit<Entity, "id">

    type CatalogBody = Pick<CatalogItem, "name">

    type ProductBody = Omit<Product, "supplier" | "department"> & {
        units: ProductUnits
        id_supplier: number
        id_department: number
    }

    type ProductAction<T> = (product: ProductBody) => T

    type ProductArr = Array<ProductUnit | ProductCode>

    type ProductChanges = [boolean, boolean, boolean]

    type UserBody = Omit<User, "id" | "admin"> & { id_user_type: number }

    type LoginBody = CatalogBody & { password: Maybe<string> }

    /* OTHER */

    type CatalogParams = { id?: string; table?: string }

    type CatalogMap = Record<
        string,
        { msgs: { del: string; add: string; upd: string }; table: string }
    >
}

export {}
