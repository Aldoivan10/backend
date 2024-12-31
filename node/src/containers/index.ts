import { Container } from "inversify"
import { CatalogController } from "../controllers/catalog.ctrl"
import { Controller } from "../controllers/controller"
import { CatalogDTO } from "../dtos/catalog.dto"
import { CatalogRepository } from "../repositories/catalog.repo"
import { IRepo } from "../repositories/repository"
import { CatalogService } from "../services/catalog.svc"
import { IService } from "../services/service"
import { CatalogType } from "../validations/catalog.val"
import { Types } from "./types"

export const container = new Container()

// Registrar repositorios
container
    .bind<IRepo<Body.Catalog>>(Types.CatalogRepository)
    .to(CatalogRepository)
// Registrar servicios
container
    .bind<IService<Body.Catalog, CatalogDTO>>(Types.CatalogService)
    .to(CatalogService)
// Registrar controladores
container
    .bind<Controller<CatalogType, Body.Catalog, CatalogDTO>>(
        Types.CatalogController
    )
    .to(CatalogController)
