import { Request, Response } from "express"

// Convertir los campos de un objeto a otro objeto (DTO)
export const mapTo = <T>(obj: Maybe<Obj>, mapper?: Record<string, string>) => {
    if (!obj) return null
    if (!mapper) return obj as T
    const mapped: Obj = {}
    for (const key in mapper) mapped[key] = obj[mapper[key]]
    return mapped as T
}

// Mappear objeto a BD (poner en null los campos que no sean requeridos y falten)
export const toBD = <T>(obj: Obj, attrs: string[]) => {
    for (const attr of attrs) obj[attr] = obj[attr] ?? null
    return obj as T
}

// Obtenemos los datos base de cada petición
export const getBase = <G>(req: Request, res?: Response) => {
    const { filter = "%", limit = 10, offset = 0 }: Filters = req.query
    const id: number = +req.params.id
    const pathFilter = req.params.filter
    const ids: number[] = req.body.ids ?? []
    const user = res?.locals.user
    const item = req.body as G
    return {
        id,
        ids,
        user,
        item,
        filter: { filter: pathFilter ?? filter, limit, offset },
    }
}

// Mapea un objeto a JSON (si contienen objetos como string)
export const toJSON = <T>(item: Maybe<Obj>) => {
    if (item) {
        for (const key in item) {
            try {
                let val = JSON.parse(item[key])
                if (Array.isArray(val)) val.map(toJSON<any>)
                if (typeof val === "object") val = toJSON<Object>(val)
                item[key] = val
            } catch (e) {}
        }
        return item as T
    }
    return null
}

// Función para filtrar valores falsy
export const notFalsy = <T>(val: Maybe<T>): val is T =>
    val !== null && val !== undefined
