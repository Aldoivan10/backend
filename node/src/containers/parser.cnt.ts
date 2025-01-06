import { Container } from "inversify"
import { Controller } from "../controllers/controller"
import { ParserController } from "../controllers/parser.ctrl"
import { ParserDTO } from "../dtos/parser.dto"
import { ParserRepository } from "../repositories/parser.repo"
import { IRepo } from "../repositories/repository"
import { ParserService } from "../services/parser.svc"
import { IService } from "../services/service"
import { ParserSchema } from "../validations/parser.val"
import { Types } from "./types"

export function ParserContainer(container: Container) {
    container
        .bind<IRepo<Body.Parser>>(Types.ParserRepository)
        .to(ParserRepository)
    container
        .bind<IService<Body.Parser, ParserDTO>>(Types.ParserService)
        .to(ParserService)
    container
        .bind<Controller<typeof ParserSchema, Body.Parser, ParserDTO>>(
            Types.ParserController
        )
        .to(ParserController)
}
