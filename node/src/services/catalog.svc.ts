import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { CatalogDTO } from "../dtos/catalog.dto"
import { CatalogRepository } from "../repositories/catalog.repo"
import { arrConj } from "../utils/array.util"
import { notFalsy } from "../utils/obj.util"
import { Service } from "./service"

@injectable()
export class CatalogService extends Service<Body.Catalog, CatalogDTO> {
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

    constructor(
        @inject(Types.CatalogRepository)
        protected readonly repo: CatalogRepository,
        protected table: string = "Codigo"
    ) {
        super(CatalogDTO)
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
        const names = ids
            .map((id) => this.getByID(id))
            .filter(notFalsy)
            .map((item) => item.name)
        return super.delete(
            ids,
            username,
            `${this.deleteMsgs[this.table]}: ${arrConj(names)}`
        )
    }
}
