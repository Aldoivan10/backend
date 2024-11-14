import { Request } from "express"

export const getPlaceholders = (arr: any[]) => {
    return arr.map((_) => "?").join(", ")
}

export const getBase = (req: Request) => {
    const { limit = 10, offset = 0, filter = "" }: APIFilter = req.query
    const db = req.app.locals.db
    const id: number = +req.params.id
    const ids: number[] = req.body.ids ?? []
    return { db, id, ids, limit, offset, filter }
}
