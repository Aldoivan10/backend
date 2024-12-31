import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { ProductDTO } from "../dtos/product.dto"
import { CatalogRepository } from "../repositories/catalog.repo"
import ProductRepository from "../repositories/product.repo"
import { Service } from "./service"

@injectable()
export class ProductService extends Service<Body.Product, ProductDTO> {
    constructor(
        @inject(Types.CatalogRepository)
        protected readonly catalogSvc: CatalogRepository,
        @inject(Types.ProductRepository)
        protected readonly repo: ProductRepository
    ) {
        super(ProductDTO)
    }

    public add(body: Body.Product, username: string) {
        body = this.sanitize(body)
        return super.insert(body, username)
    }

    public edit(id: number, body: Body.Product, username: string) {
        const old = this.getByID(id)
        if (!old) return null
        body = this.sanitize(body)
        return super.update(id, body, username)
    }

    public remove(ids: number[], username: string): ProductDTO[] {
        return super.delete(ids, username, "Los productos")
    }

    protected sanitize(body: Body.Product) {
        body.refundable = Number(body.refundable)
        body.units = body.units.map((unit, index) =>
            index === 0 ? unit : { ...unit, profit: null }
        )
        return body
    }

    /* protected hasChanges(oldArr: ProductArr, newArr: ProductArr) {
        if (oldArr.some((old) => !newArr.find((_) => old.id === _.id)))
            return true
        if ("code" in oldArr[0]) {
            const oldCodes = oldArr as ProductCode[]
            const newCodes = newArr as ProductCode[]

            for (const code of newCodes) {
                const item = oldCodes.find((item) => item.id === code.id)
                if (item) {
                    if (item.code !== code.code) return true
                    continue
                } else return true
            }
        } else {
            const oldUnits = oldArr as ProductUnit[]
            const newUnits = newArr as ProductUnit[]

            for (const unit of newUnits) {
                const item = oldUnits.find((item) => item.id === unit.id)
                if (item) {
                    if (
                        item.profit !== (unit.profit ?? null) ||
                        item.sale !== unit.sale
                    )
                        return true
                    continue
                }
                return true
            }
        }
        return false
    } */
}
