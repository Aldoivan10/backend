import { Expose, Transform } from "class-transformer"

export class BudgetDTO {
    @Expose({ name: "usuario" })
    declare user: string

    @Expose({ name: "fecha" })
    @Transform(({ value }) => new Date(value))
    declare date: Date

    @Expose()
    @Transform(({ obj }) => ({
        id: obj.id_entidad,
        name: obj.entidad,
    }))
    declare entity: DTO.Item

    @Expose({ name: "productos" })
    @Transform(({ value }) => {
        const arr: DTO.ProductBudget[] = JSON.parse(value)
        return arr.map((item) => ({
            product: { id: item.id_producto, name: item.producto },
            unit: { id: item.id_unidad, name: item.unidad },
            amount: item.cantidad,
        }))
    })
    declare items: Array<{
        product: DTO.Item
        entity: DTO.Item
        unit: DTO.Item
        amount: number
    }>
}
