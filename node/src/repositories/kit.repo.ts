import { Transaction } from "better-sqlite3"
import Repository from "./repository"

export default class KitRepo extends Repository<KitBody, Kit> {
    private insertStm: Transaction<(kit: KitBody) => Kit>
    private updateStm: Transaction<(id: number, kit: KitBody) => Maybe<Kit>>

    protected mapper: Record<string, string> = {
        id: "id",
        name: "nombre",
        products: "productos",
    }

    constructor() {
        super("Kit_Vista")
        this.init({ columns: Object.values(this.mapper) })

        const insertKitStm = this.db.prepare<CatalogItem, unknown>(
            "INSERT INTO Kit VALUES (@id, @name)"
        )
        const inserProductStm = this.db.prepare<
            { kit: number } & KitProduct,
            unknown
        >("INSERT INTO Producto_Kit VALUES (@kit, @id, @unit, @amount)")
        const updateKitStm = this.db.prepare<
            ID & CatalogBody,
            Maybe<CatalogItem>
        >("UPDATE Kit SET nombre=@name WHERE id=@id RETURNING *")
        const selectProductsStm = this.db.prepare<[number], KitProduct>(
            "SELECT id_producto id, id_unidad unit, cantidad amount FROM Producto_Kit WHERE id_kit=?"
        )
        const deleteProductsStm = this.db.prepare<number, unknown>(
            "DELETE FROM Producto_Kit WHERE id_kit=?"
        )

        this.insertStm = this.db.transaction((kit) => {
            const kitID = this.nextID()!
            insertKitStm.run({ id: kitID, name: kit.name })
            for (const product of kit.products) {
                inserProductStm.run({ kit: kitID, ...product })
            }
            return this.getByID(kitID)
        })

        this.updateStm = this.db.transaction((id, kit) => {
            const item = updateKitStm.get({ id, name: kit.name })
            const products = selectProductsStm.all(id)

            const change = kit.products.some((p) => {
                const product = products.find((_) => _.id === p.id)
                return product?.unit !== p.unit || product?.amount !== p.amount
            })

            if (change) {
                deleteProductsStm.run(id)
                for (const product of kit.products) {
                    inserProductStm.run({ kit: id, ...product })
                }
            }

            return item || change ? this.getByID(id) : null
        })
    }

    public insert(item: KitBody) {
        return this.insertStm(item)
    }

    public update(id: number, item: KitBody) {
        return this.updateStm(id, item)
    }
}
