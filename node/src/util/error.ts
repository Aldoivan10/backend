import { APIError, ValError } from "../model/error"

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
    } else if (message.includes("not valid JSON")) {
        path = "body"
        msg = message
        location = "validation"
        return new ValError({ error: { location, path, msg } }, 400)
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
