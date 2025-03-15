import { SqliteError } from "better-sqlite3"
import { NextFunction, Response } from "express"
import { inject } from "inversify"
import { Types } from "../containers/types"
import { BudgetDTO } from "../dtos/budget.dto"
import { DBError } from "../models/error"
import { BudgetService } from "../services/budget.svc"
import { BudgetSchema } from "../validations/budget.val"
import { DateRangeSchema } from "../validations/general.val"
import { Controller } from "./controller"

export class BudgetController extends Controller<
    typeof BudgetSchema,
    Body.Budget,
    BudgetDTO
> {
    protected readonly messages = {
        create: "Presupuesto creado",
        update: "No se puede modificar un presupuesto",
        delete: "Presupuestos eliminados",
    }

    constructor(
        @inject(Types.BudgetService) protected readonly svc: BudgetService
    ) {
        super(["usuario", "fecha", "hora", "entidad"])
    }

    public rangeDelete(
        req: Express.BodyRequest<typeof DateRangeSchema>,
        res: Response,
        next: NextFunction
    ): void {
        try {
            const user = req.user!
            const items = this.svc.removeBetween(req.body, user.name)
            res.json(items)
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }
}
