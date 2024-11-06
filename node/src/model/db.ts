import { existsSync } from "fs"
import sqlite from "sqlite3"

class DBError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "DBError"
    }
}

export default class DB {
    db!: sqlite.Database

    async open(path: string) {
        if (!path) throw new DBError("Se requiere la ruta de la base de datos")
        if (!path.endsWith(".db"))
            throw new DBError(`${path} no es un archivo de base de datos`)
        if (!existsSync(path)) throw new DBError(`El archivo ${path} no existe`)
        this.db = await this.getDataBase(path)
        return this
    }

    private getDataBase(path: string) {
        return new Promise<sqlite.Database>((resolve, reject) => {
            const db = new sqlite.Database(path, (err) => {
                if (err) reject(err)
                resolve(db)
            })
        })
    }

    async fetch<T>(query: string, params: any[] = []) {
        return new Promise<T[]>((resolve, reject) => {
            this.db.all<T>(query, params, async (err, rows) => {
                if (err) reject(err)
                /*  const casted = rows.map((row) => {
                    for (const key in row as Object) {
                        try {
                            row[key] = JSON.parse(row[key])
                        } catch {
                            row[key] = row[key]
                        }
                    }
                    return row
                }) */
                resolve(rows)
            })
        })
    }

    async insert(query: string, params: any[] = []) {
        const db = this.db
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run("BEGIN TRANSACTION")
                this.db.run(query, params, function (err) {
                    if (err) {
                        db.run("ROLLBACK")
                        reject(err)
                    } else {
                        db.run("COMMIT")
                        resolve(db)
                    }
                })
            })
        })
    }

    async lastID(table: string) {
        return new Promise<number>((resolve, reject) => {
            const query = `
            SELECT COALESCE(MIN(id) + 1, 1) AS id
            FROM ${table} t1
            WHERE NOT EXISTS (SELECT 1 FROM ${table} t2 WHERE t2.id = t1.id + 1);`
            this.db.get<TableID>(query, (err, row) => {
                if (err) reject(err)
                resolve(row.id)
            })
        })
    }

    close() {
        if (this.db) this.db.close()
    }
}
