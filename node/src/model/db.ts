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

    async all<T>(
        table: string,
        columns: string[],
        filters: [string, number, number],
        order = "nombre"
    ) {
        const cols = columns.join(", ")
        const query = `
        SELECT ${cols} 
        FROM ${table} 
        WHERE ${order} LIKE ? 
        ORDER BY ${order}
        LIMIT ? OFFSET ?`
        return await this.fetch<T>(query, filters)
    }

    async allByID<T>(
        table: string,
        columns: string[],
        ids: number[],
        order = "nombre"
    ) {
        const cols = columns.join(", ")
        const query = `
        SELECT ${cols} 
        FROM ${table} 
        WHERE id IN (${ids.map((_) => "?").join()})  
        ORDER BY ${order}`
        return await this.fetch<T>(query, ids)
    }

    async fetch<T>(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<T[]>((resolve, reject) => {
            db.all<T>(query, params, async (err, rows) => {
                if (err) return reject(err)
                rows.map((row) => this.parse<T>(row))
                resolve(rows)
            })
        })
    }

    async getByID<T>(table: string, columns: string[], id: number) {
        const cols = columns.join(", ")
        const query = `
        SELECT ${cols} 
        FROM ${table} 
        WHERE id = ?`
        return await this.get<T>(query, [id])
    }

    async get<T>(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<T>((resolve, reject) => {
            db.get<T>(query, params, (err, row) => {
                if (err) reject(err)
                else resolve(this.parse<T>(row))
            })
        })
    }

    async multiple(...queries: Array<[string, any[]]>) {
        const db = this.checkDB()
        return new Promise<sqlite.RunResult>((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION")

                const promises = queries.map(([query, params]) => {
                    return new Promise<void>((resolve, reject) => {
                        db.run(query, params ?? [], (err) => {
                            if (err) return reject(err)
                            resolve()
                        })
                    })
                })

                Promise.all(promises)
                    .then(() => {
                        db.run("COMMIT", function (err) {
                            if (err) db.run("ROLLBACK", () => reject(err))
                            else resolve(this)
                        })
                    })
                    .catch((err) => {
                        db.run("ROLLBACK", () => reject(err))
                    })
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
                db.get(`${query} RETURNING *`, params, (err, result: T[]) => {
                    if (err) {
                        db.run("ROLLBACK")
                        reject(err)
                    } else {
                        db.run("COMMIT", (err) => {
                            const rows = Array.isArray(result)
                                ? result
                                : [result]
                            if (err) return reject(err)
                            rows.map((row) => this.parse<T>(row))
                            resolve(rows)
                        })
                    }
                })
            })
        })
    }

    async queryAndGet<T>(query: string, params: any[] = []) {
        const db = this.checkDB()
        return new Promise<T>((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION")
                db.get(`${query} RETURNING *`, params, (err, row: T) => {
                    if (err) {
                        db.run("ROLLBACK")
                        reject(err)
                    } else {
                        db.run("COMMIT")
                        resolve(this.parse<T>(row))
                    }
                })
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

    parse<T>(row: any) {
        for (const key in row) {
            try {
                row[key] = JSON.parse(row[key])
            } catch {}
        }
        return row as T
    }

    close() {
        if (this.db) {
            this.db.close()
            this.db = null
        }
    }
}
