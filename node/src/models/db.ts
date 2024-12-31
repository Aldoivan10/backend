import Database from "better-sqlite3"
import { injectable } from "inversify"
import { DB_PATH } from "../config"

@injectable()
export class APIDataBase extends Database {
    constructor() {
        super(DB_PATH, {
            fileMustExist: true,
            timeout: 5000,
        })
        this.pragma("cache_size = 32000")
        this.pragma("foreign_keys = ON")
        this.pragma("journal_mode = WAL")
    }
}
