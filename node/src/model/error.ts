export class APIError extends Error {
    errors: APIErrorsArr = []
    name: string = "APIError"
    status: number

    constructor({ message, error, errors, name, status = 500 }: APIErrorArgs) {
        super(message)
        if (name) this.name = name
        if (error) this.errors.push({ ...error, type: this.name })
        if (errors) this.errors = errors
        this.status = status
    }
}

export class ValError extends APIError {
    constructor(
        args: Omit<APIErrorArgs, "status" | "message" | "name">,
        status: 400 | 422 = 422
    ) {
        super({
            ...args,
            status,
            name: "ValidationError",
            message: "Error en los datos enviados",
        })
    }
}

export class AuthError extends APIError {
    constructor(args: Omit<APIErrorArgs, "status" | "message" | "name">) {
        super({
            ...args,
            status: 401,
            name: "AuthError",
            message: "Usuario no autorizado",
        })
    }
}

export class DBError extends APIError {
    name = "DBError"

    constructor(args: Omit<APIErrorArgs, "status">) {
        super({ ...args, status: 401 })
    }

    static ERROPEN = "Error al abrir la base de datos"
    static ERRQUERY = "Error al ejecutar query"
    static ERRCREATE = "Error al crear la tabla"
    static ERRINSERT = "Error al insertar datos"
    static ERRUPDATE = "Error al actualizar datos"
    static ERRDELETE = "Error al eliminar datos"
}
