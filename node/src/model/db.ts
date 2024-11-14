import { existsSync } from "fs"
import sqlite from "sqlite3"
import { DBError } from "../api/util/error"
import { getPlaceholders } from "../api/util/util"

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
            await this.query("PRAGMA foreign_keys = ON")
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

    async insert<T>(table: string, params: any[]) {
        const id = await this.lastID(table)
        const query = `
            INSERT INTO ${table}
            VALUES (${getPlaceholders(params)})`
        return await this.queryAndGet<T>(query, [id, ...params])
    }

    async update<T>(
        table: string,
        columns: string[],
        id: number,
        params: any[]
    ) {
        const cols = columns.map((col) => `${col} = ?`).join(", ")
        const query = `
            UPDATE ${table} 
            SET ${cols}
            WHERE id = ?`
        return await this.queryAndGet<T>(query, [...params, id])
    }

    async delete<T>(table: string, ids: number[]) {
        const placeholders = getPlaceholders(ids)
        const query = `
            DELETE FROM ${table}
            WHERE id IN (${placeholders})`
        return await this.queryAndAll<T>(query, ids)
    }

    async queryAndAll<T>(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<T[]>((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION")
                db.get(
                    `${query} RETURNING *`,
                    params,
                    function (err: Error | null, rows: T[]) {
                        if (err) {
                            db.run("ROLLBACK")
                            reject(err)
                        } else {
                            db.run("COMMIT")
                            resolve(rows)
                        }
                    }
                )
            })
        })
    }

    async queryAndGet<T>(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<T>((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION")
                db.get(
                    `${query} RETURNING *`,
                    params,
                    function (err: Error | null, row: T) {
                        if (err) {
                            db.run("ROLLBACK")
                            reject(err)
                        } else {
                            db.run("COMMIT")
                            resolve(row)
                        }
                    }
                )
            })
        })
    }

    async query(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<sqlite.RunResult>((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) reject(err)
                else resolve(this)
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
