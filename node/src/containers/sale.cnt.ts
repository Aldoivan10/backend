import { Container } from "inversify"
import { Controller } from "../controllers/controller"
import { SaleControlller } from "../controllers/sale.ctrl"
import { SaleDTO } from "../dtos/sale.dto"
import { IRepo } from "../repositories/repository"
import { SaleRepository } from "../repositories/sale.repo"
import { SaleService } from "../services/sale.svc"
import { IService } from "../services/service"
import { SaleSchema } from "../validations/sale.val"
import { Types } from "./types"

export function SaleContainer(container: Container) {
    container.bind<IRepo<Body.Sale>>(Types.SaleRepository).to(SaleRepository)
    container
        .bind<IService<Body.Sale, SaleDTO>>(Types.SaleService)
        .to(SaleService)
    container
        .bind<Controller<typeof SaleSchema, Body.Sale, SaleDTO>>(
            Types.SaleController
        )
        .to(SaleControlller)
}
