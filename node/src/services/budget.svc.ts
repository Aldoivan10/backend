import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { BudgetDTO } from "../dtos/budget.dto"
import { BudgetRepository } from "../repositories/budget.repo"
import { Service } from "./service"

@injectable()
export class BudgetService extends Service<Body.Budget, BudgetDTO> {
    constructor(
        @inject(Types.BudgetRepository)
        protected readonly repo: BudgetRepository,
        protected readonly table = "Presupuesto_Vista"
    ) {
        super(BudgetDTO)
    }

    add(body: Body.Budget, username: string): BudgetDTO {
        return super.insert(body, username)
    }

    edit(id: number, body: Body.Budget, username: string): Maybe<BudgetDTO> {
        return super.update(id, body, username)
    }

    remove(ids: number[], username: string): BudgetDTO[] {
        return super.delete(ids, username, "Los presupuestos")
    }
}
