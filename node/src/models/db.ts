import Database from "better-sqlite3"
import { DB_PATH } from "../config"

const db = new Database(DB_PATH, {
    fileMustExist: true,
    timeout: 5000,
})

db.pragma("cache_size = 32000")
db.pragma("foreign_keys = ON")
db.pragma("journal_mode = WAL")

export default db
