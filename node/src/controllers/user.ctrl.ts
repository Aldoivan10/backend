import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { UserDTO } from "../dtos/user.dto"
import { UserService } from "../services/user.svc"
import { UserSchema } from "../validations/user.val"
import { Controller } from "./controller"

@injectable()
export class UserController extends Controller<
    typeof UserSchema,
    Body.User,
    UserDTO
> {
    protected readonly messages = {
        create: "Usuario creado",
        update: "Usuario actualizado",
        delete: "Usuarios eliminados",
    }

    constructor(
        @inject(Types.ProductService) protected readonly svc: UserService
    ) {
        super(["nombre", "role"])
    }
}
