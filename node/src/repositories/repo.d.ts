declare namespace Repo {
    type Insert<I> = (input: I, user: string) => Obj

    type Update<I> = (id: number, input: I, user: string) => Obj

    type Change = [number, "Creó" | "Modificó" | "Eliminó", string]

    type Delete = (ids: number[], user: string, desc: string) => Array<Obj>

    type InitUser = { nombre: string; atajos: string }

    type TokenUser = { id: number; name: string; role: string; logged: boolean }
}

declare namespace Body {
    type Catalog = { name: string }

    type Entity = {
        rfc: string | null
        id_entity_type: number
        name: string
        address: string | null
        domicile: string | null
        postal_code: string | null
        phone: string | null
        email: string | null
    }

    type User = {
        name: string
        password: Maybe<string>
        id_user_type: number
    }

    type Shortcut = Array<ID & { shortcut: string }>

    type Code = { id: number; code: string }

    type Unit = { id: number; profit: number | null; sale: number }

    type Product = {
        id_department: number
        id_supplier: number
        name: string
        amount: number
        buy: number
        min: number
        refundable: boolean | number
        codes: Code[]
        units: Unit[]
    }
}
