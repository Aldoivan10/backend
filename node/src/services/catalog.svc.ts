import { CatalogDTO } from "../dtos/catalog.dto"
import { CatalogRepository } from "../repositories/catalog.repo"
import { Service } from "./service"

export class CatalogService extends Service<Body.Catalog, CatalogDTO> {
    protected repo: CatalogRepository
    private tables: Record<string, string> = {
        code: "Codigo",
        unit: "Unidad",
        entity_type: "Tipo_Entidad",
        department: "Departamento",
        user_type: "Tipo_Usuario",
    }
    private deleteMsgs: Record<string, string> = {
        code: "Los códigos",
        unit: "Las unidades",
        entity_type: "Los tipos de entidad",
        department: "Los departamentos",
        user_type: "Los tipos de usuario",
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

    public add(body: Body.Catalog, username: string) {
        return super.insert(body, username)
    }

    public edit(id: number, body: Body.Catalog, username: string) {
        return super.update(id, body, username)
    }

    public remove(ids: number[], username: string) {
        return super.delete(ids, username, this.deleteMsgs[this.table])
    }
}
