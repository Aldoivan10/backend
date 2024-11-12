export class APIError extends Error {
    errors: APIErrorsArr = []
    name: string = "APIError"
    request: string
    status: number

    constructor({
        status = 500,
        message,
        error,
        errors,
        name,
        request,
    }: APIErrorArgs) {
        super(message)
        if (error) this.errors.push({ ...error, type: this.name })
        if (errors) this.errors = errors
        if (name) this.name = name
        this.request = request
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
