import DB from "../model/db"

declare global {
    namespace Express {
        interface Locals {
            db: DB
        }
    }

    type TableID = { id: number }
}

export {}
