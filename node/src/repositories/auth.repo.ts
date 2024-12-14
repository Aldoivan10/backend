import { Statement } from "better-sqlite3"
import { samePass } from "../util/auth.util"
import { notFalsy, toJSON } from "../util/obj.util"
import Repository from "./repository"

export default class AuthRepo extends Repository<any, UserToken> {
    protected insertStm!: Statement<any, any>
    protected updateStm!: Statement<any, any>
    private loginStm: Statement<LoginBody, User>
    private availibleStm: Statement<[], User>
    private passStm: Statement<ID, { hashed: Maybe<string> }>

    constructor() {
        super("Usuario")
        this.passStm = this.db.prepare(
            `SELECT contrasenia AS hashed FROM ${this.table} WHERE id=@id`
        )
        this.loginStm = this.db.prepare(
            `SELECT U.id, U.nombre AS name, TU.nombre AS role, false AS logged FROM ${this.table} U INNER JOIN Tipo_Usuario TU ON U.id_tipo_usuario=TU.id WHERE U.nombre = @username`
        )
        this.availibleStm = this.db.prepare(
            "SELECT name, shortcuts FROM Usuarios_Vista ORDER BY name"
        )
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
        if (samePass(password, result?.hashed)) {
            user.logged = true
            return true
        }
        return false
    }

    insert(_: any): UserToken {
        throw new Error("Method not implemented.")
    }

    update(_: number, __: any): any {
        throw new Error("Method not implemented.")
    }

    delete(_: DeleteArgs): any {
        throw new Error("Method not implemented.")
    }

    all(_: Filters): any {
        throw new Error("Method not implemented.")
    }

    getByID(_: number): any {
        throw new Error("Method not implemented.")
    }
}
