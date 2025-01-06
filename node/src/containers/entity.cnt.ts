import { Container } from "inversify"
import { Controller } from "../controllers/controller"
import { EntityController } from "../controllers/entity.ctrl"
import { EntityDTO } from "../dtos/entity.dto"
import { EntityRepository } from "../repositories/entity.repo"
import { IRepo } from "../repositories/repository"
import { EntityService } from "../services/entity.svc"
import { IService } from "../services/service"
import { EntitySchema } from "../validations/entity.val"
import { Types } from "./types"

export function EntityContainer(container: Container) {
    container
        .bind<IRepo<Body.Entity>>(Types.EntityRepository)
        .to(EntityRepository)
    container
        .bind<IService<Body.Entity, EntityDTO>>(Types.EntityService)
        .to(EntityService)
    container
        .bind<Controller<typeof EntitySchema, Body.Entity, EntityDTO>>(
            Types.EntityController
        )
        .to(EntityController)
}
