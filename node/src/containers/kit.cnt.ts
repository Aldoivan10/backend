import { container } from "."
import { Controller } from "../controllers/controller"
import { KitController } from "../controllers/kit.ctrl"
import { KitDTO } from "../dtos/kit.dto"
import { KitRepository } from "../repositories/kit.repo"
import { IRepo } from "../repositories/repository"
import { KitService } from "../services/kit.svc"
import { IService } from "../services/service"
import { KitSchema } from "../validations/kit.val"
import { Types } from "./types"

container.bind<IRepo<Body.Kit>>(Types.KitRepository).to(KitRepository)
container.bind<IService<Body.Kit, KitDTO>>(Types.KitService).to(KitService)
container
    .bind<Controller<typeof KitSchema, Body.Kit, KitDTO>>(Types.KitController)
    .to(KitController)
