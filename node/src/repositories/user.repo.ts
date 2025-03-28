import { Transaction } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"
import { Repository } from "./repository"

@injectable()
export default class UserRepository extends Repository<Body.User> {
    protected insertStm: Transaction<Repo.Insert<Body.User>>
    protected updateStm: Transaction<Repo.Update<Body.User>>
    private shortcutsStm: Transaction<
        (id: number, shortcuts: Body.Shortcut) => boolean
    >

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        super(
            db,
            ["id", "nombre", "contrasenia", "id_rol", "rol"],
            "Usuario_Vista"
        )
        const insertSCStm = this.db.prepare<[string, number, number]>(
            "UPDATE Usuario_Atajo SET atajo=? WHERE id_usuario=? AND id_atajo=? RETURNING *"
        )
        const insertStm = this.db.prepare<Body.User>(
            "INSERT INTO Usuario(id_tipo_usuario, nombre, contrasenia) VALUES (@id_user_type, @name, @password)"
        )
        const updateStm = this.db.prepare<Body.User & ID, ID>(
            "UPDATE Usuario SET id_tipo_usuario=@id_user_type, nombre=@name, contrasenia=@password WHERE id=@id RETURNING id"
        )
        this.insertStm = this.db.transaction((input, user) => {
            this.logStm.run(user)

            const result = insertStm.run(input)
            const id = Number(result.lastInsertRowid)
            return this.getByID(id)
        })
        this.updateStm = this.db.transaction((id, input, user) => {
            this.logStm.run(user)
            const updated = updateStm.get({ id, ...input })
            return updated ? this.getByID(id) : null
        })
        this.shortcutsStm = this.db.transaction((id_user, shortcuts) =>
            shortcuts
                .map(({ id, shortcut }) =>
                    insertSCStm.get(shortcut, id_user, id)
                )
                .some(Boolean)
        )
    }

    public updShortcuts(id: number, shortcuts: Body.Shortcut) {
        return this.shortcutsStm(id, shortcuts)
    }
}
