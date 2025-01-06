import { inject } from "inversify"
import { Types } from "../containers/types"
import { BudgetDTO } from "../dtos/budget.dto"
import { BudgetService } from "../services/budget.svc"
import { BudgetSchema } from "../validations/budget.val"
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
        super(["usuario", "fecha", "entidad"])
    }
}
