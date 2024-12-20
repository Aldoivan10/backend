import { CatalogDTO } from "../dtos/catalog.dto"
import { CatalogRepository } from "../repositories/catalog.repo"
import { Service } from "./service"

export class CatalogService extends Service<CatalogBody, CatalogDTO> {
    protected repo: CatalogRepository
    private tables: Record<string, string> = {
        code: "Codigo",
        unit: "Unidad",
        entity_type: "Tipo_Entidad",
        department: "Departamento",
        user_type: "Tipo_Usuario",
    }
    private targetMsgs: Record<string, string> = {
        code: "el código",
        unit: "la unidad",
        entity_type: "el tipo de entidad",
        department: "el departamento",
        user_type: "el tipo de usuario",
    }
    private deleteMsgs: Record<string, string> = {
        code: "los códigos",
        unit: "las unidades",
        entity_type: "los tipos de entidad",
        department: "los departamentos",
        user_type: "los tipos de usuario",
    }

    constructor(protected table: string = "Codigo") {
        super(CatalogDTO)
        this.repo = new CatalogRepository()
    }

    public setTable(table: string) {
        this.repo.setTable(this.tables[table])
        this.table = table
        return this
    }

    public add(body: CatalogBody, username: string) {
        const desc = this.getChange({
            type: "add",
            user: username,
            target: this.targetMsgs[this.table],
            items: [body.name],
        })
        const item = super.insert(body, { user: username, desc })
        return item
    }

    public edit(id: number, body: CatalogBody, username: string) {
        const old = this.getByID(id)
        if (!old) return null
        const desc = this.getChange({
            type: "upd",
            user: username,
            target: this.targetMsgs[this.table],
            items: [`de ${old.name} a ${body.name}`],
        })
        const item = super.update(id, body, { user: username, desc })
        return item
    }

    public remove(ids: number[], username: string) {
        const names = ids
            .map(this.getByID.bind(this))
            .map((i) => i?.name)
            .filter(Boolean)
        const desc = this.getChange({
            type: "upd",
            user: username,
            target: this.deleteMsgs[this.table],
            items: names,
        })
        const items = super.delete(ids, { user: username, desc })
        return items
    }
}
