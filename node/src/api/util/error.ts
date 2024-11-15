import { ValidationError } from "express-validator"

export class APIError extends Error {
    errors: APIErrorsArr = []
    name: string = "APIError"
    status: number

    constructor({ message, error, errors, name, status = 500 }: APIErrorArgs) {
        super(message)
        if (error) this.errors.push({ ...error, type: this.name })
        if (errors) this.errors = errors
        if (name) this.name = name
        this.status = status
    }
}

export class ValError extends APIError {
    name = "ValidationError"

    static ERRCREATE = (item: string) => `Error al crear nuevo ${item}`
    static ERRVAL = "Error en los datos enviados"
}

export class DBError extends APIError {
    name = "DBError"

    static ERROPEN = "Error al abrir la base de datos"
    static ERRQUERY = "Error al ejecutar query"
    static ERRCREATE = "Error al crear la tabla"
    static ERRINSERT = "Error al insertar datos"
    static ERRUPDATE = "Error al actualizar datos"
    static ERRDELETE = "Error al eliminar datos"
}

export const getError = (err: Error, status = 500) => {
    const { message, stack } = err
    let path = stack || "unknown"
    let location = "unknown"
    let msg = message

    if (message.startsWith("SQL")) {
        const [name, ...data] = message.split(": ")
        path = name
        msg = data.join(": ")
        location = "database"
    }

    return new APIError({
        message: "A ocurrido un error inesperado",
        status,
        error: {
            location,
            path,
            msg,
        },
    })
}

export const getValError = (
    msg: string,
    errors: ValidationError[],
    status = 400
) => {
    return new ValError({
        message: msg,
        errors,
        status,
    })
}
