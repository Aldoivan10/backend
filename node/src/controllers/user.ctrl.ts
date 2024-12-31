import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response } from "express"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { UserDTO } from "../dtos/user.dto"
import { DBError } from "../models/error"
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

    public setShortcuts(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.user!.id
            const { shortcuts } = req.body
            const updated = this.svc.shortcuts(id, shortcuts)
            res.json({
                msg: updated
                    ? "Aatajos actualizados"
                    : "No hubo modificaicones",
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }
}
