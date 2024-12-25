import bcrypt from "bcrypt"
import { PASS_SALT } from "../config"
import { UserDTO } from "../dtos/user.dto"
import UserRepo from "../repositories/user.repo"
import { Service } from "./service"

export class UserService extends Service<Body.User, UserDTO> {
    protected repo: UserRepo

    constructor() {
        super(UserDTO)
        this.repo = new UserRepo()
    }

    public add(body: Body.User, username: string) {
        body.password =
            body.id_user_type === 1 ? this.hashPass(body.password) : undefined
        return super.insert(body, username)
    }

    public edit(id: number, body: Body.User, username: string) {
        const old = this.getByID(id, ["admin"])
        if (!old) return null
        if (body.id_user_type === 1) {
            if (this.samePass(body.password, old.password))
                body.password = old.password
            else body.password = this.hashPass(body.password)
        } else body.password = undefined
        const updated = super.update(id, body, username)
        return updated ? this.getByID(id) : null
    }

    public remove(ids: number[], username: string) {
        return super.delete(ids, username, "Los usuarios")
    }

    private hashPass(pass: Maybe<string>) {
        return pass ? bcrypt.hashSync(pass, +PASS_SALT) : undefined
    }

    private samePass(pass: Maybe<string>, hashed: Maybe<string>) {
        return !!pass && !!hashed && bcrypt.compareSync(pass, hashed)
    }
}
