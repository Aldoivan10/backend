declare namespace Repo {
    type Insert<I> = (input: I, user: string) => Obj

    type Update<I> = (id: number, input: I, user: string) => Obj

    type UpdAndLog<I> = (id: number, input: I, user: string, log: string) => Obj

    type Change = [number, "Creó" | "Modificó" | "Eliminó", string]

    type Delete = (ids: number[], user: string, desc: string) => Array<Obj>

    type Dates = { init: string; end: string }

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

    type KitProduct = {
        id: number
        unit: number
        amount: number
    }

    type Kit = {
        name: string
        products: KitProduct[]
    }

    type BudgetItem = {
        id_product: number
        id_unit: number
        amount: number
    }

    type Budget = {
        id_entity: number
        items: BudgetItem[]
    }

    type Parser = {
        id_unit: number
        id_sub_unit: number
        multiplier: number
    }

    type ProductSale = {
        product: string
        unit: string
        amount: number
        sale: number
        new_sale: number | null
    }

    type Sale = {
        total: number
        discount: number | null
        new_total: number | null
        entity: string
        items: ProductSale[]
    }
}
