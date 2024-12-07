import bcrypt from "bcrypt"
import { Statement } from "better-sqlite3"
import { PASS_SALT } from "../config"
import { toJSON } from "../util/util"
import Repository from "./repository"

export default class UserRepo extends Repository<UserBody, User> {
    protected allStm: Statement<Filters, Obj>
    protected getByIDStm: Statement<ID, Obj>
    private insertStm: Statement<UserBody & ID, Obj>
    private updateStm: Statement<UserBody & ID, Obj>
    private passStm: Statement<ID, { hashed: Maybe<string> }>

    constructor() {
        super("Usuario")
        const select =
            "SELECT U.id, U.nombre AS name, U.contrasenia AS password, JSON_Object('id', TU.id, 'name', TU.nombre) AS role FROM Usuario U INNER JOIN Tipo_Usuario TU ON U.id_tipo_usuario=TU.id"

        this.allStm = this.db.prepare(
            `${select} WHERE U.nombre LIKE @filter ORDER BY U.nombre LIMIT @limit OFFSET @offset`
        )
        this.getByIDStm = this.db.prepare(`${select} WHERE U.id = @id`)
        this.insertStm = this.db.prepare(
            "INSERT INTO Usuario VALUES (@id, @id_user_type, @name, @password)"
        )
        this.updateStm = this.db.prepare(
            "UPDATE Usuario SET id_tipo_usuario=@id_user_type, nombre=@name, contrasenia=@password WHERE id=@id RETURNING nombre"
        )
        this.passStm = this.db.prepare(
            "SELECT contrasenia AS hashed FROM Usuario WHERE id=@id"
        )
    }

    all = (filter: Filters) =>
        this.allStm
            .all(filter)
            .map(toJSON<User>)
            .map(this.removePass)

    getByID = (id: number) =>
        this.removePass(toJSON<User>(this.getByIDStm.get({ id })))

    insert(item: UserBody) {
        const id = this.nextID()!
        this.insertStm.run({
            id,
            ...item,
            password: this.hashPass(item.password),
        })
        const user = this.getByIDStm.get({ id })
        return this.removePass(toJSON<User>(user))
    }

    update(id: number, item: UserBody) {
        const { hashed } = this.passStm.get({ id })!

        if (!this.samePass(hashed, item.password))
            item.password = this.hashPass(item.password)

        const updated = this.updateStm.get({
            id,
            ...item,
        })

        if (!updated) return null

        const user = this.getByIDStm.get({ id })
        return this.removePass(toJSON<User>(user))
    }

    samePass(pass: Maybe<string>, hashed: Maybe<string>) {
        return !!pass && !!hashed && !bcrypt.compareSync(pass, hashed)
    }

    hashPass(pass: Maybe<string>) {
        return pass ? bcrypt.hashSync(pass, +PASS_SALT) : null
    }

    removePass(user: User) {
        if (user) delete user.password
        return user
    }
}
