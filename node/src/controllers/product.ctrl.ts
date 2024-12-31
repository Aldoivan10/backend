import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { ProductDTO } from "../dtos/product.dto"
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
            "reembolsable",
        ])
    }
}
