import bcrypt from "bcrypt"
import { Request } from "express"

// Creamos un placeholder de ? para un arreglo
export const getPlaceholders = (arr: any[]) => {
    return arr.map((_) => "?").join()
}

// Obtenemos los datos base de cada petición
export const getBase = (req: Request) => {
    const { limit = 10, offset = 0, filter = "" }: APIFilter = req.query
    const db = req.app.locals.db
    const id: number = +req.params.id
    const ids: number[] = req.body.ids ?? []
    return { db, id, ids, limit, offset, filter }
}

// Validamos que la contraseña sea correcta
export const isPass = (pass: string, hashed: string) => {
    return bcrypt.compareSync(pass, hashed)
}
