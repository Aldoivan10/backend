import { Database } from "better-sqlite3"
import db from "../models/db"

export class DBRepo {
    protected readonly db: Database = db
}
