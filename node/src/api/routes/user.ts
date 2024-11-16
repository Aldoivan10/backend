import bcrypt from "bcrypt"
import { NextFunction, Request, Response, Router } from "express"
import { PASS_SALT } from "../config"
import { validationMW } from "../middleware/validationMW"
import { getBase } from "../util/util"
import * as GeneralVal from "../validations/generalVal"
import { userVal } from "../validations/userVal"

const router = Router()
const table = "Usuario"
const columns = ["id", "id_tipo_usuario AS id_user_type", "nombre AS name"]

const isPass = (pass: string, hashed: string) => {
    return bcrypt.compareSync(pass, hashed)
}

const getPass = (pass: string) => {
    return pass ? bcrypt.hashSync(pass, PASS_SALT) : pass
}

// Obtener todos
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { db, limit, offset, filter } = getBase(req)
        const arrFilter: Filters = [`%${filter}%`, limit, offset]
        const data = await db.all<UserType>(table, columns, arrFilter)
        res.json({ data })
    } catch (err) {
        next(err)
    }
})

// Obtener por ID
router.get(
    "/:id(\\d+)",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, id } = getBase(req)
            const user = await db.getByID<UserType>(table, columns, id)
            res.json({ data: user ?? null })
        } catch (err) {
            next(err)
        }
    }
)

// Agregar usuario
router.post(
    "/",
    validationMW(userVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db } = getBase(req)
            const { name, password, id_user_type }: UserBody = req.body
            const data = await db.insert<UserType>(
                table,
                [id_user_type, name, getPass(password)],
                columns
            )
            res.status(201).json({
                message: "Usuario creado",
                data,
            })
        } catch (err) {
            next(err)
        }
    }
)

// Eliminar
router.delete(
    "/",
    validationMW(GeneralVal.ids),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, ids } = getBase(req)
            const data = await db.delete<UserType>(table, ids, columns)
            res.send({
                message: "Usuarios eliminados",
                data,
            })
        } catch (err) {
            next(err)
        }
    }
)

// Actualizar
router.patch(
    "/:id(\\d+)",
    validationMW(userVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, id } = getBase(req)
            const { name, password, id_user_type }: UserBody = req.body
            const { hashed } = await db.getByID<{ hashed: string }>(
                table,
                ["contrasenia AS hashed"],
                id
            )
            const samePass = isPass(password, hashed)
            const pass = samePass ? hashed : getPass(password)
            const item = await db.update<UserType>(
                table,
                ["id_tipo_usuario", "nombre", "contrasenia"],
                id,
                [id_user_type, name, pass],
                columns
            )
            if (item)
                res.json({
                    message: "Usuario actualizado",
                    data: item,
                })
            else
                res.json({
                    message: "No hubo modificaciones",
                    data: item ?? null,
                })
        } catch (err) {
            next(err)
        }
    }
)

export default router
