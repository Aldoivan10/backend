import { Container } from "inversify"
import { BudgetController } from "../controllers/budget.ctrl"
import { Controller } from "../controllers/controller"
import { BudgetDTO } from "../dtos/budget.dto"
import { BudgetRepository } from "../repositories/budget.repo"
import { IRepo } from "../repositories/repository"
import { BudgetService } from "../services/budget.svc"
import { IService } from "../services/service"
import { BudgetSchema } from "../validations/budget.val"
import { Types } from "./types"

export function BudgetContainer(container: Container) {
    container
        .bind<IRepo<Body.Budget>>(Types.BudgetRepository)
        .to(BudgetRepository)
    container
        .bind<IService<Body.Budget, BudgetDTO>>(Types.BudgetService)
        .to(BudgetService)
    container
        .bind<Controller<typeof BudgetSchema, Body.Budget, BudgetDTO>>(
            Types.BudgetController
        )
        .to(BudgetController)
}
