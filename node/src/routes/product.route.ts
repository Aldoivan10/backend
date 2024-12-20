import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response, Router } from "express"
import { requireAdminMW, tokenMW } from "../middleware/token.mw"
import { validationMW } from "../middleware/validation.mw"
import { DBError } from "../model/error"
import ProductRepository from "../repositories/product.repo"
import { getBase } from "../util/obj.util"
import * as GeneralVal from "../validations/general.val"
import { productVal } from "../validations/product.val"

const router = Router()
const repo = new ProductRepository()

// Obtener por ID
router.get("/:id(\\d+)", (req, res, next) => {
    try {
        const { id } = getBase(req)
        const data = repo.getByID(id)
        res.json({ data })
    } catch (err) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Obtener por filtro like con *
router.get("/:filter(.*\\*.*)", (req, res, next) => {
    try {
        const { filter } = getBase(req)
        filter.filter = filter.filter
            .split("*")
            .filter(Boolean)
            .map((str) => `%${str.trim()}%`)
            .join("")
        const data = repo.all(filter)
        res.json({ data })
    } catch (err) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Obtener por filtro
router.get("/:filter?", (req, res, next) => {
    try {
        const { filter } = getBase(req)
        const data = repo.all(filter)
        res.json({ data })
    } catch (err) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Insertar un producto
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(productVal),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const product: ProductBody = req.body
            const item = repo.insert(product)
            res.status(201).json({ message: "Producto creado", data: item })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.insert(err))
            else next(err)
        }
    }
)

// Actualizar
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(productVal),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = getBase(req)
            const product: ProductBody = req.body
            const item = repo.update(id, product)
            res.send({
                message: item
                    ? "Producto actualizado"
                    : "No hubo modificaciones",
                data: item,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.update(err))
            else next(err)
        }
    }
)

// Eliminar
router.delete(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(GeneralVal.ids),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ids, user } = getBase(req)
            const products = repo.delete({
                ids,
                username: user?.name,
            })
            res.send({ message: "Productos eliminados", products })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }
)

export default router
