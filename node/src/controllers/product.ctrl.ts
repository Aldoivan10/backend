import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response } from "express"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { ProductDTO } from "../dtos/product.dto"
import { DBError } from "../models/error"
import { ProductService } from "../services/product.svc"
import { ProductSchema } from "../validations/product.val"
import { Controller } from "./controller"

@injectable()
export class ProductController extends Controller<
    typeof ProductSchema,
    Body.Product,
    ProductDTO
> {
    protected readonly messages = {
        create: "Producto creado",
        update: "Producto actualizado",
        delete: "Productos eliminado",
    }

    constructor(
        @inject(Types.ProductService) protected readonly svc: ProductService
    ) {
        super([
            "departamento",
            "proveedor",
            "nombre",
            "cantidad",
            "min",
            "compra",
            "reembolsable",
        ])
    }

    public findByCode(req: Request, res: Response, next: NextFunction) {
        try {
            const code = req.params.code
            const item = this.svc.getByCode(code)
            res.json(item)
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }
}
