import { existsSync } from "fs"
import sqlite from "sqlite3"
import { DBError } from "../api/util/error"

export default class DB {
    db: sqlite.Database | null = null

    async open(path: string) {
        this.close()
        if (!path)
            throw new DBError({
                message: DBError.ERROPEN,
                error: {
                    msg: "No se proporcionó ninguna ruta",
                    location: "params",
                    path: "path",
                    value: path,
                },
            })
        if (!path.endsWith(".db"))
            throw new DBError({
                message: DBError.ERROPEN,
                error: {
                    msg: `${path} no es un archivo de base de datos válido`,
                    location: "params",
                    path: "path",
                    value: path,
                },
            })
        if (!existsSync(path))
            throw new DBError({
                message: DBError.ERROPEN,
                error: {
                    msg: `El archivo ${path} no existe`,
                    location: "params",
                    path: "path",
                    value: path,
                },
            })
        try {
            this.db = await this.getDataBase(path)
            return this
        } catch (e) {
            const err = e as Error
            throw new DBError({
                message: DBError.ERROPEN,
                error: {
                    msg: err.message,
                    location: "open",
                    path: "method",
                },
            })
        }
    }

    private getDataBase(path: string) {
        return new Promise<sqlite.Database>((resolve, reject) => {
            const db = new sqlite.Database(path, (err) => {
                if (err) reject(err)
                else resolve(db)
            })
        })
    }

    private checkDB() {
        if (!this.db)
            throw new DBError({
                message: DBError.ERRQUERY,
                error: {
                    msg: "No hay base de datos abierta",
                    location: "query",
                    path: "method",
                },
            })
        return this.db
    }

    async fetch<T>(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<T[]>((resolve, reject) => {
            db.all<T>(query, params, async (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    }

    async get<T>(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<T>((resolve, reject) => {
            db.get<T>(query, params, (err, row) => {
                if (err) reject(err)
                else resolve(row)
            })
        })
    }

    async insert(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION")
                db.run(query, params, (err: Error | null) => {
                    if (err) {
                        db.run("ROLLBACK")
                        reject(err)
                    } else {
                        db.run("COMMIT")
                        resolve()
                    }
                })
            })
        })
    }

    async remove(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION")
                db.run(query, params, (err: Error | null) => {
                    if (err) {
                        db.run("ROLLBACK")
                        reject(err)
                    } else {
                        db.run("COMMIT")
                        resolve()
                    }
                })
            })
        })
    }

    async query(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<void>((resolve, reject) => {
            db.run(query, params, async (err) => {
                if (err) reject(err)
                else resolve()
            })
        })
    }

    async lastID(table: string) {
        const db = this.checkDB()
        return new Promise<number>((resolve, reject) => {
            const query = `
            SELECT COALESCE(MIN(id) + 1, 1) AS id
            FROM ${table} t1
            WHERE NOT EXISTS (SELECT 1 FROM ${table} t2 WHERE t2.id = t1.id + 1);`
            db.get<TableID>(query, (err, row) => {
                if (err) reject(err)
                else resolve(row.id)
            })
        })
    }

    close() {
        if (this.db) {
            this.db.close()
            this.db = null
        }
    }
}
