import { Result } from "express-validator"

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

    static unprocessed(): never {
        throw new ValidError({
            details: [
                {
                    msg: "Formato JSON no válido",
                    location: "body",
                    field: null,
                },
            ],
            code: "ERR_UNPROCESSED",
            status: 400,
        })
    }

    static fromExpress(errors: Result<ExpressValidationError>): never {
        const details = errors.array().map((err) => ({
            field: err.param!,
            msg: err.msg,
            location: err.location!,
        }))
        throw new ValidError({ details })
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
    }: Omit<APIErrorArgs, "message" | "code">): never {
        throw new DBError({
            message: "Error al abrir la base de datos",
            code: "ERR_OPEN",
            status,
            details,
        })
    }

    static ERROPEN = "Error al abrir la base de datos"
    static ERRQUERY = "Error al ejecutar query"
    static ERRCREATE = "Error al crear la tabla"
    static ERRINSERT = "Error al insertar datos"
    static ERRUPDATE = "Error al actualizar datos"
    static ERRDELETE = "Error al eliminar datos"
}
