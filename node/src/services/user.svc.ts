import bcrypt from "bcrypt"
import { inject, injectable } from "inversify"
import { PASS_SALT } from "../config"
import { Types } from "../containers/types"
import { UserDTO } from "../dtos/user.dto"
import UserRepo from "../repositories/user.repo"
import { arrConj } from "../utils/array.util"
import { notFalsy } from "../utils/obj.util"
import { Service } from "./service"

@injectable()
export class UserService extends Service<Body.User, UserDTO> {
    constructor(
        @inject(Types.UserRepository) protected readonly repo: UserRepo
    ) {
        super(UserDTO)
    }

    public add(body: Body.User, username: string) {
        if (body.id_user_type == 1) body.password = this.hashPass(body.password)
        else body.password = null
        return super.insert(body, username)
    }

    public edit(id: number, body: Body.User, username: string) {
        const old = this.getByID(id, ["admin"])
        if (!old) return null
        body.password =
            body.id_user_type === 1
                ? this.getPass(body.password, old.password)
                : null

        return super.update(id, body, username) ? this.getByID(id) : null
    }

    public remove(ids: number[], username: string) {
        const names = ids
            .map((id) => this.getByID(id))
            .filter(notFalsy)
            .map((item) => item.name)
        return super.delete(ids, username, `Los usuarios: ${arrConj(names)}`)
    }

    public shortcuts(id: number, shortcuts: Body.Shortcut) {
        return this.repo.updShortcuts(id, shortcuts)
    }

    private getPass(pass: Maybe<string>, hashed: Maybe<string>) {
        return this.samePass(pass, hashed) ? hashed : this.hashPass(pass)
    }

    private hashPass(pass: Maybe<string>) {
        return pass ? bcrypt.hashSync(pass, +PASS_SALT) : null
    }

    private samePass(pass: Maybe<string>, hashed: Maybe<string>) {
        return !!pass && !!hashed && bcrypt.compareSync(pass, hashed)
    }
}
