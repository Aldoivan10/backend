import bcrypt from "bcrypt"
import { Statement, Transaction } from "better-sqlite3"
import { PASS_SALT } from "../config"
import { samePass } from "../util/auth.util"
import { toJSON } from "../util/obj.util"
import Repository from "./repository"

export default class UserRepo extends Repository<UserBody, User> {
    protected insertStm: Statement<UserBody & ID, User>
    protected updateStm: Statement<UserBody & ID, User>
    private shortcutsStm: Transaction<
        (id: number, shortcuts: ShortcutBody[]) => boolean
    >
    protected mapper: Record<string, string> = {
        id: "id",
        role: "role",
        name: "nombre",
        password: "contrasenia",
    }

    constructor() {
        super("Usuario_Vista")
        this.init({ columns: Object.values(this.mapper) })
        const insertSCStm = this.db.prepare<[string, number, number], unknown>(
            "UPDATE Usuario_Atajo SET atajo=? WHERE id_usuario=? AND id_atajo=? RETURNING *"
        )
        this.insertStm = this.db.prepare(
            "INSERT INTO Usuario VALUES (@id, @id_user_type, @name, @password)"
        )
        this.updateStm = this.db.prepare(
            "UPDATE Usuario SET id_tipo_usuario=@id_user_type, nombre=@name, contrasenia=@password WHERE id=@id RETURNING nombre"
        )
        this.shortcutsStm = this.db.transaction((id_user, shortcuts) =>
            shortcuts
                .map(({ id, shortcut }) =>
                    insertSCStm.get(shortcut, id_user, id)
                )
                .some(Boolean)
        )
    }

    public all(filter: Filters) {
        const users = super.all(filter)
        users.forEach(this.removePass)
        return users
    }

    public getByID(id: number) {
        const user = super.getByID(id)
        this.removePass(user)
        return user
    }

    public delete(args: Omit<DeleteArgs, "target">) {
        const users = super.delete({ ...args, target: "los usuarios" })
        users.forEach(this.removePass)
        return users
    }

    public insert(item: UserBody) {
        const id = this.nextID()!
        this.insertStm.run({
            id,
            ...item,
            password: this.hashPass(item.password),
        })
        const user = this.getByIDStm.get({ id })
        return this.removePass(toJSON<User>(user))!
    }

    public update(id: number, item: UserBody) {
        const { password: hashed } = this.getByID(id)!

        if (samePass(item.password, hashed)) item.password = hashed
        else item.password = this.hashPass(item.password)

        const updated = this.updateStm.get({
            id,
            ...item,
        })

        if (!updated) return null

        const user = this.getByIDStm.get({ id })
        return this.removePass(toJSON<User>(user))
    }

    public shortcuts(id: number, shortcuts: ShortcutBody[]) {
        return this.shortcutsStm(id, shortcuts)
    }

    private hashPass(pass: Maybe<string>) {
        return pass ? bcrypt.hashSync(pass, +PASS_SALT) : null
    }

    private removePass(user: Maybe<User>) {
        if (user) delete user.password
        return user
    }
}
