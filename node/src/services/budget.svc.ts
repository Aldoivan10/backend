import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { BudgetDTO } from "../dtos/budget.dto"
import { BudgetRepository } from "../repositories/budget.repo"
import { arrConj } from "../utils/array.util"
import { notFalsy } from "../utils/obj.util"
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
        const budgets = ids
            .map((id) => this.getByID(id))
            .filter(notFalsy)
            .map((item) => `${item.date} - ${item.entity}`)
        return super.delete(
            ids,
            username,
            `Los presupuestos: ${arrConj(budgets)}`
        )
    }

    removeBetween(dates: Dates, username: string) {
        const range = dates.end
            ? `entre ${dates.init} - ${dates.end}`
            : `del día ${dates.init}`
        return this.repo.deleteBetween(
            { init: dates.init, end: dates.end ?? dates.init },
            username,
            `Los presupuestos ${range}`
        )
    }
}
