import bcrypt from "bcrypt"
import { Request } from "express"

// Creamos un placeholder de ? para un arreglo
export const getPlaceholders = (arr: any[]) => {
    return arr.map((_) => "?").join()
}

// Convertir los campos de un objeto a otro objeto (DTO)
export const mapTo = <T>(
    obj?: Record<string, any>,
    mapper?: Record<string, string>
) => {
    if (!obj) return null
    if (!mapper) return obj as T
    const mapped: Record<string, any> = {}
    for (const key in mapper) mapped[key] = obj[mapper[key]]
    return mapped as T
}

// Mappear objeto a BD (poner en null los campos que no sean requeridos y falten)
export const toBD = <T>(obj: Record<string, any>, attrs: string[]) => {
    for (const attr of attrs) obj[attr] = obj[attr] ?? null
    return obj as T
}

// Obtenemos los datos base de cada petición
export const getBase = (req: Request) => {
    const { filter = "%%", limit = 10, offset = 0 }: Filters = req.query
    const id: number = +req.params.id
    const ids: number[] = req.body.ids ?? []
    return { id, ids, filter: { filter, limit, offset } }
}

// Validamos que la contraseña sea correcta
export const isPass = (pass: string, hashed: string) => {
    return bcrypt.compareSync(pass, hashed)
}

export const getTokens = (req: Request) => {
    const { name }: LoginBody = req.body
    const cookies = req.cookies
    return [cookies[`${name}_at`], cookies[`${name}_rt`]]
}