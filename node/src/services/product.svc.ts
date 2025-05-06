import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { ProductDTO } from "../dtos/product.dto"
import { CatalogRepository } from "../repositories/catalog.repo"
import ProductRepository from "../repositories/product.repo"
import { arrConj } from "../utils/array.util"
import { notFalsy } from "../utils/obj.util"
import { Service } from "./service"

@injectable()
export class ProductService extends Service<Body.Product, ProductDTO> {
    constructor(
        @inject(Types.CatalogRepository)
        protected readonly catalogRepo: CatalogRepository,
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
        const changes = this.getChanges(body, old)
        if (!changes) return null
        const obj = this.repo.updateAndLog(
            id,
            body,
            username,
            `El producto ${old.name}: ${changes}`
        )
        return this.mapper(obj)
    }

    public remove(ids: number[], username: string): ProductDTO[] {
        const names = ids
            .map((id) => this.getByID(id))
            .filter(notFalsy)
            .map((item) => item.name)
        return super.delete(ids, username, `Los productos: ${arrConj(names)}`)
    }

    public getByCode(code: string, groups?: string[]) {
        return this.mapper(this.repo.getByCode(code), groups)
    }

    protected sanitize(body: Body.Product) {
        body.refundable = Number(body.refundable)
        body.units = body.units.map((unit, index) =>
            index === 0 ? unit : { ...unit, profit: null }
        )
        return body
    }

    protected getChanges(body: Body.Product, old: ProductDTO) {
        const codesChanges = this.getCodesChanges(body.codes, old.codes)
        const unitsChanges = this.getUnitsChanges(body.units, old.units)

        const changes: string[] = []

        if (body.name !== old.name) changes.push(`nombre a ${body.name}`)
        if (body.amount !== old.amount)
            changes.push(`cantidad de ${old.amount} a ${body.amount}`)
        if (body.min !== old.min)
            changes.push(`cantidad mínima de ${old.min} a ${body.min}`)
        if (Boolean(body.refundable) !== old.refundable)
            changes.push(
                `reembolsable de ${old.refundable ? "sí" : "no"} a ${body.refundable ? "sí" : "no"
                }`
            )
        if (body.id_supplier !== old.supplier.id) {
            const supplier = this.getSupplierName(body.id_supplier)
            changes.push(`proveedor de ${old.supplier.name} a ${supplier}`)
        }
        if (body.id_department !== old.department.id) {
            const department = this.getSupplierName(body.id_supplier)
            changes.push(`departamento de ${old.supplier.name} a ${department}`)
        }

        return `${arrConj(changes)}${codesChanges}${unitsChanges}`
    }

    protected getCodesChanges(
        newCodes: Body.Code[],
        oldCodes: Array<DTO.Code>
    ) {
        const changes: string[] = []
        for (const code of newCodes) {
            const old = oldCodes.find((_) => _.id === code.id)
            if (old) {
                if (old.code !== code.code)
                    changes.push(
                        `cambió ${old.name} de ${old.code} a ${code.code}`
                    )
            } else {
                const name = this.getCodeName(code.id)
                changes.push(`agregó ${name} con código ${code.code}`)
            }
        }
        for (const code of oldCodes) {
            if (!newCodes.find((_) => _.id === code.id))
                changes.push(`eliminó ${code.name}`)
        }
        if (!changes.length) return ""
        return `\nCódigos: ${arrConj(changes)}`
    }

    protected getUnitsChanges(
        newUnits: Body.Unit[],
        oldUnits: Array<DTO.Unit>
    ) {
        const changes: string[] = []
        for (const unit of newUnits) {
            const old = oldUnits.find((_) => _.id === unit.id)
            if (old) {
                const unitChange: string[] = []
                if (old.profit !== unit.profit)
                    unitChange.push(
                        `ganancia de ${old.profit} a ${unit.profit}`
                    )
                if (old.sale !== unit.sale)
                    unitChange.push(`venta de ${old.sale} a ${unit.sale}`)
                if (unitChange.length)
                    changes.push(`cambió ${old.name} ${arrConj(unitChange)}`)
            } else {
                const name = this.getUnitName(unit.id)
                changes.push(`agregó ${name}`)
            }
        }
        for (const unit of oldUnits) {
            if (!newUnits.find((_) => _.id === unit.id))
                changes.push(`eliminó ${unit.name}`)
        }
        if (!changes.length) return ""
        return `\nUnidades: ${arrConj(changes)}`
    }

    protected getSupplierName(id: number) {
        const supplier = this.catalogRepo.setTable("Entidad").getByID(id)
        return supplier?.nombre ?? "Desconocido"
    }

    protected getDepartmentName(id: number) {
        const department = this.catalogRepo.setTable("Departamento").getByID(id)
        return department?.nombre ?? "Desconocido"
    }

    protected getCodeName(id: number) {
        const code = this.catalogRepo.setTable("Codigo").getByID(id)
        return code?.nombre ?? "Desconocido"
    }

    protected getUnitName(id: number) {
        const unit = this.catalogRepo.setTable("Unidad").getByID(id)
        return unit?.nombre ?? "Desconocida"
    }
}
