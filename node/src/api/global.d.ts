import { Schema, ValidationError } from "express-validator"
import DB from "../model/db"
import { APIError } from "./util/error"

declare global {
    namespace Express {
        interface Locals {
            db: DB
            error?: APIError
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
        errors?: Array<ValidationError>
    }

    type APIErrorsArr = Array<
        ErrorItem | (ValidationError & { path?: string; location?: string })
    >

    type ValMWArgs = { schema: Schema; item?: string }

    type APIFilter = { limit?: number; offset?: number; filter?: string }

    type CatalogParams = { id?: string; table?: string }

    type CatalogMap = Record<
        string,
        { msgs: { del: string; add: string; upd: string }; table: string }
    >

    type DelBody = { ids: number[] }

    type CatalogBody = { name: string } & DelBody

    type ProductBody = Omit<Product, "id" | "sales"> & { units: ProductUnits }

    type EntityBody = Omit<Entity, "id">

    type TableID = { id: number }

    type CatalogItem = { id: number; name: string }

    type ProductUnit = { id: number; sale: number; profit: number }

    type ProductUnits = [ProductUnit, ...Omit<ProductUnit, "profit">[]]

    type Code = { id: number; code: string }

    type Entity = CatalogItem & {
        id_entity_type: number
        rfc?: string
        address?: string
        domicile?: string
        postal_code?: string
        phone?: string
        email?: string
    }

    type Product = CatalogItem & {
        units: ProductUnit[]
        codes: { id: number; code: string }[]
        id_department: number
        refundable?: boolean
        id_supplier: number
        amount: number
        buy: number
        min: number
    }
}

export {}
