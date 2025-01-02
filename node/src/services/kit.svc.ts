import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { KitDTO } from "../dtos/kit.dto"
import { CatalogRepository } from "../repositories/catalog.repo"
import { KitRepository } from "../repositories/kit.repo"
import { arrConj } from "../utils/array.util"
import { Service } from "./service"

@injectable()
export class KitService extends Service<Body.Kit, KitDTO> {
    constructor(
        @inject(Types.CatalogRepository)
        protected readonly catalogRepo: CatalogRepository,
        @inject(Types.KitRepository)
        protected readonly repo: KitRepository
    ) {
        super(KitDTO)
    }

    add(body: Body.Kit, username: string): KitDTO {
        return super.insert(body, username)
    }

    edit(id: number, body: Body.Kit, username: string): Maybe<KitDTO> {
        const old = this.getByID(id)
        if (!old) return null
        const changes = this.getChanges(body, old)
        if (!changes) return null
        return super.update(id, body, username)
    }

    remove(ids: number[], username: string): KitDTO[] {
        return super.delete(ids, username, "Los kits")
    }

    protected getChanges(body: Body.Kit, old: KitDTO) {
        const changes: string[] = []
        const products = body.products
        const oldProducts = old.products

        if (body.name !== old.name) changes.push(`nombre a ${body.name}`)
        for (const product of products) {
            const oldProduct = oldProducts.find((p) => p.id === product.id)

            if (!oldProduct) {
                const pName = this.getProductName(product.id)
                const uName = this.getUnitName(product.unit)
                changes.push(`agregó ${pName}[${uName}]`)
            } else {
                const unit = oldProduct.units.find((u) => u.id === product.unit)
                if (!unit) {
                    const uName = this.getUnitName(product.unit)
                    changes.push(`agregó ${oldProduct.name}[${uName}]`)
                } else if (product.amount !== unit.amount) {
                    changes.push(
                        `cantidad ${oldProduct.name}[${unit.name}] de ${oldProduct.amount} a ${product.amount}`
                    )
                }
            }
        }

        for (const oldProduct of oldProducts) {
            const newProducts = products.filter((p) => p.id === oldProduct.id)
            if (newProducts.length) {
                for (const { unit: idUnit } of newProducts) {
                    const unit = oldProduct.units.find((u) => u.id === idUnit)
                    if (!unit) {
                        const uName = this.getUnitName(idUnit)
                        changes.push(`eliminó ${oldProduct.name}[${uName}]`)
                    }
                }
            } else changes.push(`eliminó el producto ${oldProduct.name}`)
        }

        return arrConj(changes)
    }

    protected getUnitName(id: number) {
        const unit = this.catalogRepo.setTable("Unidad").getByID(id)
        return unit?.nombre ?? "Desconocido"
    }

    protected getProductName(id: number) {
        const product = this.catalogRepo.setTable("Producto").getByID(id)
        return product?.nombre ?? "Desconocido"
    }
}
