import { Transaction } from "better-sqlite3"
import { getPlaceholders, toJSON } from "../util/util"
import Repository from "./repository"

export default class ProductRepository extends Repository<
    ProductBody,
    Product
> {
    private insertStm: Transaction<ProductTran<ProductBody, Product>>
    private updateStm: Transaction<
        ProductTran<ProductBody & ID, Maybe<Product>>
    >

    constructor() {
        super("Producto_Vista")
        const insertProductStm = this.db.prepare<ProductBody & ID, unknown>(
            "INSERT INTO Producto VALUES (@id, @id_department, @id_supplier, @name, @amount, @buy, @min, @refundable)"
        )
        const insertCodesStm = this.db.prepare<ProductCode, Obj>(
            `INSERT INTO Producto_Codigo VALUES (@id_product, @id, @code)`
        )
        const insertUnitsStm = this.db.prepare<ProductUnit, Obj>(
            `INSERT INTO Producto_Unidad VALUES (@id_product, @id, @profit, @sale)`
        )
        const delCodesStm = this.db.prepare<ID, unknown>(
            "DELETE FROM Producto_Codigo WHERE id_producto=@id"
        )
        const delUnitsStm = this.db.prepare<ID, unknown>(
            "DELETE FROM Producto_Unidad WHERE id_producto=@id"
        )
        const updateStm = this.db.prepare<ProductBody & ID, ID>(
            "UPDATE Producto SET id_departamento=@id_department,id_proveedor=@id_supplier,nombre=@name,cantidad=@amount,compra=@buy,min=@min,reembolsable=@refundable WHERE id=@id RETURNING *"
        )

        this.allStm = this.db.prepare<Filters, Obj>(
            this.allQuery(["*"], "name", "name")
        )
        this.getByIDStm = this.db.prepare(this.getByIDQuery(["*"]))
        this.insertStm = this.db.transaction((product) => {
            const id = this.nextID()!
            const codes = this.getCodes(id, product)
            const units = this.getUnits(id, product)

            insertProductStm.run({
                id,
                ...product,
                refundable: Number(product.refundable),
            })

            for (const code of codes) insertCodesStm.run(code)
            for (const unit of units) insertUnitsStm.run(unit)
            return this.getByID(id)
        })
        this.updateStm = this.db.transaction((product) => {
            const changes: ProductChanges = [false, false, false]
            const oldProduct = this.getByID(product.id)

            const newCodes = this.getCodes(product.id, product)
            const oldCodes = this.getCodes(oldProduct.id, oldProduct)

            if (this.hasChanges(oldCodes, newCodes)) {
                changes[0] = true
                delCodesStm.run(product)
                for (const code of newCodes) insertCodesStm.run(code)
            }

            const newUnits = this.getUnits(product.id, product)
            const oldUnits = this.getUnits(oldProduct.id, oldProduct)

            if (this.hasChanges(oldUnits, newUnits)) {
                changes[1] = true
                delUnitsStm.run(product)
                for (const unit of newUnits) insertUnitsStm.run(unit)
            }

            const item = updateStm.get(product)
            changes[2] = Boolean(item)

            return changes.some(Boolean) ? this.getByID(product.id) : null
        })
    }

    all = (filter: Filters) => this.allStm.all(filter).map(toJSON<Product>)

    getByID = (id: number) => toJSON<Product>(this.getByIDStm.get({ id }))

    insert = (item: ProductBody) => this.insertStm(item)

    delete = (ids: number[]) => {
        const products = ids.map((id) => this.getByID(id)).filter(Boolean)
        const placeholders = getPlaceholders(ids)
        const stm = this.db.prepare<number[], ID>(
            `DELETE FROM Producto WHERE id IN (${placeholders}) RETURNING id`
        )
        const deleted = stm.all(...ids).map((item) => item.id)
        return products.filter((product) => deleted.includes(product.id))
    }

    update = (id: number, item: ProductBody) =>
        this.updateStm({ ...item, refundable: Number(item.refundable), id })

    hasChanges(oldArr: ProductArr, newArr: ProductArr) {
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
    }

    getCodes(id: number, product: Pick<Product, "codes">) {
        return product.codes.map((_) => ({
            ..._,
            id_product: id,
        }))
    }

    getUnits(id: number, product: Pick<Product, "units">) {
        return product.units.map((unit) => ({
            ...unit,
            id_product: id,
            sale: unit.sale,
            profit: unit.profit ?? null,
        }))
    }
}
