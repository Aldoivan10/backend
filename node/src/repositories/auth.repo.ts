import { Statement } from "better-sqlite3"
import Repository from "./repository"

export default class AuthRepo extends Repository<string, any> {
    protected setTempUserStm: Statement<string, unknown>

    constructor() {
        super("Temporal")
        this.setTempUserStm = this.db.prepare(
            "UPDATE Temporal SET usuario=? WHERE id=1"
        )
    }

    public all(_: Filters): never[] {
        throw new Error("Method not implemented.")
    }

    public getByID(_: number) {
        throw new Error("Method not implemented.")
    }

    public insert(_: any) {
        throw new Error("Method not implemented.")
    }

    public update(id: number, item: string) {
        this.setTempUserStm.run(item)
    }
}
