import { Container } from "inversify"
import { Controller } from "../controllers/controller"
import { UserController } from "../controllers/user.ctrl"
import { UserDTO } from "../dtos/user.dto"
import { IRepo } from "../repositories/repository"
import UserRepository from "../repositories/user.repo"
import { IService } from "../services/service"
import { UserService } from "../services/user.svc"
import { UserSchema } from "../validations/user.val"
import { Types } from "./types"

export function UserContainer(container: Container) {
    container
        .bind<Controller<typeof UserSchema, Body.User, UserDTO>>(
            Types.UserController
        )
        .to(UserController)
    container
        .bind<IService<Body.User, UserDTO>>(Types.UserService)
        .to(UserService)
    container.bind<IRepo<Body.User>>(Types.UserRepository).to(UserRepository)
}
