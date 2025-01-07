import { SqliteError } from "better-sqlite3"
import { NextFunction, Response } from "express"
import { inject } from "inversify"
import { Types } from "../containers/types"
import { SaleDTO } from "../dtos/sale.dto"
import { DBError } from "../models/error"
import { SaleService } from "../services/sale.svc"
import { DateRangeSchema } from "../validations/general.val"
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
            "hora",
            "entidad",
            "total",
            "descuento",
            "nuevo_total",
        ])
    }

    public rangeDelete(
        req: Express.BodyRequest<typeof DateRangeSchema>,
        res: Response,
        next: NextFunction
    ): void {
        try {
            const user = req.user!
            const { init: initDate, end: endDate } = req.body
            const items = this.svc.removeBetween(req.body, user.name)
            const range = endDate
                ? `desde ${initDate} a ${endDate}`
                : `del día ${initDate}`
            res.send({
                message: `Se eliminaron las ventas ${range}`,
                data: items,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }
}
