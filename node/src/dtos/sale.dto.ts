import { Expose, Transform } from "class-transformer"

export class SaleDTO {
    @Expose()
    declare id: number

    @Expose({ name: "usuario" })
    declare user: string

    @Expose({ name: "entidad" })
    declare entity: string

    @Expose({ name: "fecha" })
    @Transform(({ value }) => new Date(value))
    declare date: Date

    @Expose({ name: "total" })
    declare total: number

    @Expose({ name: "descuento" })
    declare discount: number | null

    @Expose({ name: "nuevo_total" })
    declare new_total: number | null

    @Expose({ name: "productos" })
    @Transform(({ value }) => {
        const arr: Array<DTO.ProductSale> = JSON.parse(value)
        return arr.map((item) => ({
            product: item.producto,
            unit: item.unidad,
            amount: item.cantidad,
            sale: item.precio,
            new_sale: item.nuevo_precio,
        }))
    })
    declare items: Array<{
        product: string
        unit: string
        amount: number
        sale: number
        new_sale: number | null
    }>
}
