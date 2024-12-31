import { Statement } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"

@injectable()
export class AuthRepository {
    protected usersStm!: Statement<unknown[], Repo.InitUser>
    protected authStm!: Statement<string, Repo.TokenUser>

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        this.usersStm = this.db.prepare(
            "SELECT nombre, atajos FROM Usuarios_Vista"
        )
        this.authStm = this.db.prepare(
            "SELECT id, nombre, contrasenia, id_rol, rol FROM Usuario_Vista WHERE nombre = ?"
        )
    }

    public users() {
        return this.usersStm.all()
    }

    public auth(usename: string) {
        return this.authStm.get(usename)
    }
}
