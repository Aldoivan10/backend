import bcrypt from "bcrypt"
import { Request } from "express"
import { SignJWT } from "jose"
import { TK_ALG, TK_KEY } from "../config"

const encoder = new TextEncoder()

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

// Obtenemos los tokens de acceso
export const getTokens = (req: Request) => {
    const { name }: LoginBody = req.body
    const cookies = req.cookies
    return [cookies[`${name}_at`], cookies[`${name}_rt`]]
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

// Funcion para obtener el token
export const getToken = async (payload: any, time: string) => {
    const token = await new SignJWT(payload)
        .setExpirationTime(time)
        .setProtectedHeader({ alg: TK_ALG })
        .sign(encoder.encode(TK_KEY))
    return token
}
