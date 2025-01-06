import { inject } from "inversify"
import { Types } from "../containers/types"
import { SaleDTO } from "../dtos/sale.dto"
import { SaleService } from "../services/sale.svc"
import { SaleSchema } from "../validations/sale.val"
import { Controller } from "./controller"

export class SaleControlller extends Controller<
    typeof SaleSchema,
    Body.Sale,
    SaleDTO
> {
    protected messages = {
        craete: "Venta exitosa",
        delete: "Ventas eliminadas",
        update: "Ventas actualizadas",
    }

    constructor(
        @inject(Types.SaleService) protected readonly svc: SaleService
    ) {
        super([
            "usuario",
            "fecha",
            "entidad",
            "total",
            "descuento",
            "nuevo_total",
        ])
    }
}
