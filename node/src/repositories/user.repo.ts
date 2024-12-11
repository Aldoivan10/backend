import bcrypt from "bcrypt"
import { Statement, Transaction } from "better-sqlite3"
import { PASS_SALT } from "../config"
import { notFalsy, toJSON } from "../util/util"
import Repository from "./repository"

export default class UserRepo extends Repository<UserBody, User> {
    private insertStm: Statement<UserBody & ID, Obj>
    private updateStm: Statement<UserBody & ID, Obj>
    private passStm: Statement<ID, { hashed: Maybe<string> }>
    private loginStm: Statement<LoginBody, Obj>
    private availibleStm: Statement<[], Obj>
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
        this.passStm = this.db.prepare(
            "SELECT contrasenia AS hashed FROM Usuario WHERE id=@id"
        )
        this.loginStm = this.db.prepare(
            "SELECT U.id, U.nombre AS name, TU.nombre AS role, false AS logged FROM Usuario U INNER JOIN Tipo_Usuario TU ON U.id_tipo_usuario=TU.id WHERE U.nombre = @username"
        )
        this.availibleStm = this.db.prepare(
            "SELECT name, shortcuts FROM Usuarios_Vista ORDER BY name"
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

    public delete(ids: number[]) {
        const users = super.delete(ids)
        users.forEach(this.removePass)
        return users
    }

    public users() {
        return this.availibleStm
            .all()
            .map((obj) => {
                const user = toJSON<InitUser>(obj)
                if (user)
                    user.shortcuts.forEach((sc) => (sc.view = Boolean(sc.view)))
                return user
            })
            .filter(notFalsy)
    }

    public auth(data: LoginBody) {
        const user = this.loginStm.get(data)
        if (!user) return null
        return toJSON<UserToken>(user)
    }

    public login(user: UserToken, password: Maybe<string>) {
        const result = this.passStm.get(user)
        if (this.samePass(password, result?.hashed)) {
            user.logged = true
            return true
        }
        return false
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
        const { hashed } = this.passStm.get({ id })!

        if (this.samePass(item.password, hashed)) item.password = hashed
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

    private samePass(pass: Maybe<string>, hashed: Maybe<string>) {
        return !!pass && !!hashed && bcrypt.compareSync(pass, hashed)
    }

    private hashPass(pass: Maybe<string>) {
        return pass ? bcrypt.hashSync(pass, +PASS_SALT) : null
    }

    private removePass(user: Maybe<User>) {
        if (user) delete user.password
        return user
    }
}
