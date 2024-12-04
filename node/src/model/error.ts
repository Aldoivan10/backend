import { FieldValidationError } from "express-validator"

export class APIError extends Error {
    id = `ERR${new Date().getTime()}`
    details: ErrorDetail[] = []
    status: number
    code: string

    constructor({
        message,
        details,
        status = 500,
        code = "ERR_GENERIC",
    }: APIErrorArgs) {
        super(message)
        this.name = this.constructor.name
        this.details = details
        this.status = status
        this.code = code
    }
}

export class ValidError extends APIError {
    constructor({
        details,
        code = "ERR_VALIDATION",
        status = 422,
    }: ValidationErrorArgs) {
        super({
            details,
            status,
            code,
            message: "Error en los datos enviados",
        })
    }

    static unprocessed(): APIError {
        return new ValidError({
            details: [
                {
                    msg: "Formato JSON no válido",
                    type: "entity.parse.failed",
                    location: "body",
                    field: null,
                },
            ],
            code: "ERR_UNPROCESSED",
            status: 400,
        })
    }

    static fromExpress(errors: FieldValidationError[]): APIError {
        const details = errors.map((err) => ({
            msg: err.msg,
            field: err.path,
            location: err.location,
            type: err.type,
        }))
        return new ValidError({ details })
    }
}

export class AuthError extends APIError {
    constructor(args: Omit<APIErrorArgs, "status" | "message">) {
        super({
            ...args,
            status: 401,
            message: "Usuario no autorizado",
        })
    }

    /* static rol() {
        return new AuthError({
            error: {
                msg: "No cuentas con los permisos necesarios",
                location: "body",
                path: "fields",
            },
        })
    }

    static auth() {
        return new AuthError({
            error: {
                msg: "Credenciales incorrectas",
                location: "body",
                path: "fields",
            },
        })
    }

    static token() {
        return new AuthError({
            error: {
                msg: "Aun no se ha autenticado el usuario",
                location: "body",
                path: "fields",
            },
        })
    } */
}

export class DBError extends APIError {
    static open({
        details,
        status = 500,
    }: Omit<APIErrorArgs, "message" | "code">): APIError {
        return new DBError({
            message: "Error al abrir la base de datos",
            code: "ERR_OPEN",
            status,
            details,
        })
    }

    static query(err: SQLError, status = 500): APIError {
        return new DBError({
            message: "Error al ejecutar obtener los datos",
            code: err.code,
            details: [
                {
                    location: "query",
                    msg: err.message,
                    field: this.getField(err),
                    type: "sql_error",
                },
            ],
            status,
        })
    }

    static insert(err: SQLError, status = 500) {
        return new DBError({
            message: "Error al crear item",
            code: err.code,
            details: [
                {
                    location: "insert",
                    msg: err.message,
                    field: this.getField(err),
                    type: "sql_error",
                },
            ],
            status,
        })
    }

    static update(err: SQLError, status = 500) {
        return new DBError({
            message: "Error al actualizar datos",
            code: err.code,
            details: [
                {
                    location: "update",
                    msg: err.message,
                    field: this.getField(err),
                    type: "sql_error",
                },
            ],
            status,
        })
    }

    static delete(err: SQLError, status = 500) {
        return new DBError({
            message: "Error al eliminar items",
            code: err.code,
            details: [
                {
                    location: "delete",
                    msg: err.message,
                    field: this.getField(err),
                    type: "sql_error",
                },
            ],
            status,
        })
    }

    static getField(err: SQLError) {
        console.log(err)
        const arr = err.code.split("_")
        return arr[arr.length - 1]
    }
}
