import { NextFunction, Request, Response, Router } from "express"
import { validationMW } from "../middleware/validationMW"
import { getBase, getPlaceholders } from "../util/util"
import * as GeneralVal from "../validations/generalVal"
import { productVal } from "../validations/productVal"

const router = Router()
const table = "Producto"
const view = "Producto_Vista"

const getParams = (req: Request): [ProductUnits, Code[], ...any] => {
    const {
        units,
        codes,
        id_department,
        refundable,
        id_supplier,
        amount,
        name,
        buy,
        min,
    }: ProductBody = req.body

    return [
        units,
        codes,
        id_department,
        id_supplier,
        name,
        amount,
        buy,
        min,
        Boolean(refundable) ? 1 : 0,
    ]
}

const getCodesQuery = (pID: number, codes: Code[]): [string, any[]] => {
    const query = `
            INSERT INTO Producto_Codigo VALUES ${codes
                .map((_) => `(?,?,?)`)
                .join(", ")};`
    const params = codes.reduce((arr, { id, code }) => {
        arr.push(pID, id, code)
        return arr
    }, [] as any[])
    return [query, params]
}

const getSalesQuery = (pID: number, units: ProductUnits): [string, any[]] => {
    const query = `
                INSERT INTO Producto_Venta VALUES ${units
                    .map((_) => `(?,?,?,?)`)
                    .join(", ")};`
    const [{ id, sale, profit }, ...others] = units
    const params = (others ?? []).reduce(
        (arr, unit) => {
            arr.push(pID, unit.id, null, unit.sale)
            return arr
        },
        [pID, id, profit, sale] as any[]
    )
    return [query, params]
}

const hasChanges = (
    oldArr: Array<Code | ProductUnit>,
    newArr: Array<Code | ProductUnit>
) => {
    if ("code" in oldArr[0]) {
        for (const code of newArr as Code[]) {
            const item = (oldArr as Code[]).find((item) => item.id === code.id)
            if (item) {
                if (item.code !== code.code) return true
                continue
            } else return true
        }
    } else {
        for (const unit of newArr as ProductUnit[]) {
            const item = (oldArr as ProductUnit[]).find(
                (item) => item.id === unit.id
            )
            if (item) {
                if (
                    item.profit !== (unit.profit ?? null) ||
                    item.sale !== unit.sale
                )
                    return true
                continue
            }
            return true
        }
    }
    return false
}

// Obtener por ID
router.get("/:id(\\d+)", async (req, res, next) => {
    try {
        const { db, id } = getBase(req)
        const product = await db.getByID<Product>(view, ["*"], id)
        res.json({ data: product ?? null })
    } catch (err) {
        next(err)
    }
})

// Obtener por filtro like con *
router.get("/:filter(.*\\*.*)", async (req, res, next) => {
    try {
        const { db, limit, offset, filter } = getBase(req)
        const filterLike = filter
            .split("*")
            .filter(Boolean)
            .map((str) => `%${str.trim()}%`)
            .join("")
        const data = await db.all<Product>(
            view,
            ["*"],
            [filterLike, limit, offset],
            "name"
        )
        res.json({ data })
    } catch (err) {
        next(err)
    }
})

// Obtener por filtro
router.get("/:filter?", async (req, res, next) => {
    try {
        const { db, limit, offset, filter } = getBase(req)
        const data = await db.all<Product>(
            view,
            ["*"],
            [`${filter}%`, limit, offset],
            "name"
        )
        res.json({ data })
    } catch (err) {
        next(err)
    }
})

// Insertar un producto
router.post(
    "/",
    validationMW(productVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db } = getBase(req)
            const [sales, codes, ...params] = getParams(req)
            const lastID = await db.lastID(table)

            const productParams = [lastID, ...params]
            const productQuery = `
            INSERT INTO ${table} VALUES (${getPlaceholders(productParams)});`

            await db.multiple(
                [productQuery, productParams],
                getCodesQuery(lastID, codes),
                getSalesQuery(lastID, sales)
            )

            const product = await db.getByID<Product>(view, ["*"], 1)
            res.status(201).json({ message: "Producto creado", data: product })
        } catch (err) {
            next(err)
        }
    }
)

// Actualizar
router.patch(
    "/:id(\\d+)",
    validationMW(productVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, id } = getBase(req)
            const [units, codes, ...params] = getParams(req)
            const oldProduct = await db.getByID<Product>(view, ["*"], id)
            const newProduct = await db.update<any>(
                table,
                [
                    "id_departamento",
                    "id_proveedor",
                    "nombre",
                    "cantidad",
                    "compra",
                    "min",
                    "reembolsable",
                ],
                id,
                params
            )
            const changeCodes = hasChanges(oldProduct.codes, codes)
            const changeSales = hasChanges(
                oldProduct.units,
                units as ProductUnit[]
            )

            if (!newProduct && !changeCodes && !changeSales)
                res.send({
                    message: "No hubo modificaciones",
                    data: null,
                })
            else {
                if (changeCodes) {
                    await db.multiple(
                        [
                            "DELETE FROM Producto_Codigo WHERE id_producto = ?",
                            [id],
                        ],
                        getCodesQuery(id, codes)
                    )
                }

                if (changeSales) {
                    await db.multiple(
                        [
                            "DELETE FROM Producto_Venta WHERE id_producto = ?",
                            [id],
                        ],
                        getSalesQuery(id, units)
                    )
                }

                const data = await db.getByID<Product>(view, ["*"], id)
                res.send({
                    message: "Producto actualizado",
                    data,
                })
            }
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
            const data = await db.allByID<Product>(view, ["*"], ids, "id")
            await db.delete<Product>(table, ids)
            res.send({ message: "Productos eliminados", data })
        } catch (err) {
            next(err)
        }
    }
)

export default router
