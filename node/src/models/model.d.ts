declare namespace AppError {
    type Detail = {
        msg: string
        type: string
        location: string
        field: string | null
    }

    type Data = {
        code?: string
        status?: number
        message: string
        details: Detail[]
    }

    type Validation = Omit<Data, "message"> & {
        status?: 400 | 422
    }

    type SQL = Error & Required<Pick<Data, "message" | "code">>
}

declare namespace Catalog {
    type Map = Record<string, { del: string; add: string; upd: string }>
}
