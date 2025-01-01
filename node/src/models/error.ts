import {
    JOSEError,
    JWSSignatureVerificationFailed,
    JWTExpired,
    JWTInvalid,
} from "jose/errors"
import { BaseSchema, InferIssue, ValiError } from "valibot"

export class APIError extends Error {
    id = `ERR${new Date().getTime()}`
    details: AppError.Detail[] = []
    status: number
    code: string

    constructor({
        message,
        details,
        status = 500,
        code = "ERR_GENERIC",
    }: AppError.Data) {
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
    }: AppError.Validation) {
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

    static fromValibot<S extends BaseSchema<any, any, InferIssue<any>>>(
        error: ValiError<S>
    ) {
        const details = error.issues.map((issue) => ({
            msg: issue.message,
            field:
                issue.path
                    ?.map((path: Record<string, any>) => path.key)
                    ?.join(".") ?? null,
            location: "body",
            type: issue.type,
        }))
        return new ValidError({ details })
    }
}

export class AuthError extends APIError {
    constructor({
        status = 401,
        code = "ERR_AUTH",
        details,
    }: Omit<AppError.Data, "message">) {
        super({
            code,
            status,
            details,
            message: "Usuario no autorizado",
        })
    }

    static auth() {
        return new AuthError({
            details: [
                {
                    msg: "Credenciales incorrectas",
                    type: "auth.failed",
                    location: "login",
                    field: null,
                },
            ],
        })
    }

    static rol() {
        return new AuthError({
            details: [
                {
                    msg: "No cuentas con los permisos necesarios",
                    location: "login.admin",
                    type: "auth.role",
                    field: null,
                },
            ],
        })
    }

    static token() {
        return new AuthError({
            details: [
                {
                    msg: "Aun no se ha autenticado el usuario",
                    type: "auth.token",
                    location: "auth",
                    field: null,
                },
            ],
        })
    }

    static fromJWT(err: JOSEError) {
        if (err instanceof JWTExpired) {
            return new AuthError({
                details: [
                    {
                        msg: "Token caducado",
                        type: "auth.expired",
                        location: "auth",
                        field: null,
                    },
                ],
            })
        }
        if (err instanceof JWTInvalid) {
            return new AuthError({
                details: [
                    {
                        msg: "Token inválido",
                        type: "auth.invalid",
                        location: "auth",
                        field: null,
                    },
                ],
            })
        }
        if (err instanceof JWSSignatureVerificationFailed) {
            return new AuthError({
                details: [
                    {
                        msg: "No se pudo verificar el token",
                        type: "auth.verify",
                        location: "auth",
                        field: null,
                    },
                ],
            })
        }
        return new AuthError({
            details: [
                {
                    msg: err.message,
                    type: err.code,
                    location: err.name,
                    field: null,
                },
            ],
        })
    }
}

export class DBError extends APIError {
    static open({
        details,
        status = 500,
    }: Omit<AppError.Data, "message" | "code">): APIError {
        return new DBError({
            message: "Error al abrir la base de datos",
            code: "ERR_OPEN",
            status,
            details,
        })
    }

    static query(err: AppError.SQL, status = 500): APIError {
        return new DBError({
            message: "Error al obtener los datos",
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

    static insert(err: AppError.SQL, status = 500) {
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

    static update(err: AppError.SQL, status = 500) {
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

    static delete(err: AppError.SQL, status = 500) {
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

    static getField(err: AppError.SQL) {
        const arr = err.code.split("_")
        return arr[arr.length - 1]
    }
}
