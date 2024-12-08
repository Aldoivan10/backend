import bcrypt from "bcrypt"
import { Request } from "express"

// Creamos un placeholder de ? para un arreglo
export const getPlaceholders = (arr: any[]) => {
    return arr.map((_) => "?").join()
}

// Convertir los campos de un objeto a otro objeto (DTO)
export const mapTo = <T>(obj?: Obj, mapper?: Record<string, string>) => {
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
export const getBase = (req: Request) => {
    const { filter = "%", limit = 10, offset = 0 }: Filters = req.query
    const id: number = +req.params.id
    const pathFilter = req.params.filter
    const ids: number[] = req.body.ids ?? []
    return { id, ids, filter: { filter: pathFilter ?? filter, limit, offset } }
}

// Validamos que la contraseña sea correcta
export const isPass = (pass: string, hashed: string) => {
    return bcrypt.compareSync(pass, hashed)
}

// Mapea un objeto a JSON (si contienen objetos como string)
export const toJSON = <T>(item?: Obj) => {
    if (item) {
        for (const key in item) {
            try {
                item[key] = JSON.parse(item[key])
            } catch (e) {}
        }
    }
    return item as T
}
