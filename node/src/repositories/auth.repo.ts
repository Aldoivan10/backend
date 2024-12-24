import { Statement } from "better-sqlite3"
import { DBRepo } from "./db.repo"

export class AuthRepo extends DBRepo {
    protected usersStm!: Statement<unknown[], Repo.InitUser>
    protected authStm!: Statement<string, Repo.TokenUser>

    constructor() {
        super()
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
