import { Transaction } from "better-sqlite3"
import Repository from "./repository"

export default class KitRepo extends Repository<KitBody, Kit> {
    private insertStm: Transaction<(kit: KitBody) => Kit>
    private updateStm: any

    protected mapper: Record<string, string> = {
        id: "id",
        name: "nombre",
        products: "productos",
    }

    constructor() {
        super("Kit_Vista")
        this.init({ columns: Object.values(this.mapper) })

        const insertKitStm = this.db.prepare<[number, string], unknown>(
            "INSERT INTO Kit VALUES (?, ?)"
        )
        const inserProductStm = this.db.prepare<
            [number, number, number, number],
            unknown
        >("INSERT INTO Producto_Kit VALUES (?, ?, ?, ?)")

        this.insertStm = this.db.transaction((kit) => {
            const kitID = this.nextID()!
            insertKitStm.run(kitID, kit.name)
            for (const { id, unit, amount } of kit.products) {
                inserProductStm.run(kitID, id, unit, amount)
            }
            return this.getByID(kitID)
        })
    }

    public insert(item: KitBody) {
        return this.insertStm(item)
    }

    public update(id: number, item: KitBody) {
        return undefined
    }
}
