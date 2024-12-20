import { Transaction } from "better-sqlite3"
import Repository from "./repository"

export default class ProductRepository extends Repository<
    ProductBody,
    Product
> {
    protected insertStm: Transaction<(product: ProductBody) => Product>
    protected updateStm: Transaction<
        (product: ProductBody, id: number) => Maybe<Product>
    >
    protected mapper: Record<string, string> = {
        id: "id",
        min: "min",
        name: "nombre",
        codes: "codigos",
        units: "unidades",
        amount: "cantidad",
        supplier: "proveedor",
        department: "departamento",
        refundable: "reembolsable",
    }

    constructor() {
        super("Producto_Vista")
        this.init({ columns: Object.values(this.mapper) })

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
        const updateStm = this.db.prepare<ProductBody, ID>(
            "UPDATE Producto SET id_departamento=@id_department,id_proveedor=@id_supplier,nombre=@name,cantidad=@amount,compra=@buy,min=@min,reembolsable=@refundable WHERE id=@id RETURNING *"
        )

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
        this.updateStm = this.db.transaction((product, id) => {
            const changes: ProductChanges = [false, false, false]
            const oldProduct = this.getByID(id)
            const objID = { id }

            if (!oldProduct) return null

            const newCodes = this.getCodes(id, product)
            const oldCodes = this.getCodes(oldProduct.id, oldProduct)

            if (this.hasChanges(oldCodes, newCodes)) {
                changes[0] = true
                delCodesStm.run(objID)
                for (const code of newCodes) insertCodesStm.run(code)
            }

            const newUnits = this.getUnits(id, product)
            const oldUnits = this.getUnits(oldProduct.id, oldProduct)

            if (this.hasChanges(oldUnits, newUnits)) {
                changes[1] = true
                delUnitsStm.run(objID)
                for (const unit of newUnits) insertUnitsStm.run(unit)
            }

            const item = updateStm.get(product)
            changes[2] = Boolean(item)

            return changes.some(Boolean) ? this.getByID(id) : null
        })
    }

    public insert(item: ProductBody) {
        return this.insertStm(item)
    }

    public update(id: number, item: ProductBody) {
        return this.updateStm(
            { ...item, refundable: Number(item.refundable) },
            id
        )
    }

    public delete(args: Omit<DeleteArgs, "target">) {
        return super.delete({ ...args, target: "los productos" })
    }

    protected hasChanges(oldArr: ProductArr, newArr: ProductArr) {
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

    protected getCodes(id: number, product: Pick<Product, "codes">) {
        return product.codes.map((_) => ({
            ..._,
            id_product: id,
        }))
    }

    protected getUnits(id: number, product: Pick<Product, "units">) {
        return product.units.map((unit) => ({
            ...unit,
            id_product: id,
            sale: unit.sale,
            profit: unit.profit ?? null,
        }))
    }
}
