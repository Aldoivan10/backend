import { container } from "."
import { AuthController } from "../controllers/auth.ctrl"
import { AuthRepository } from "../repositories/auth.repo"
import { AuthService } from "../services/auth.svc"
import { Types } from "./types"

container.bind<AuthRepository>(Types.AuthRepository).to(AuthRepository)
container.bind<AuthService>(Types.AuthService).to(AuthService)
container.bind<AuthController>(Types.AuthController).to(AuthController)
