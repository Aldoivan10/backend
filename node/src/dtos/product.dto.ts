import { Expose, Transform } from "class-transformer"

export class ProductDTO {
    @Expose()
    declare id: number

    @Expose({ name: "nombre" })
    declare name: string

    @Expose({ name: "cantidad" })
    declare amount: number

    @Expose()
    declare min: number

    @Expose({ name: "reembolsable" })
    @Transform(({ value }) => JSON.parse(value))
    declare refundable: boolean

    @Expose()
    @Transform(({ obj }) => ({ id: +obj.id_proveedor, name: obj.proveedor }))
    declare supplier: Record<string, any>

    @Expose()
    @Transform(({ obj }) => ({
        id: +obj.id_departamento,
        name: obj.departamento,
    }))
    declare department: Record<string, any>

    @Expose({ name: "codigos" })
    @Transform(({ value }) => {
        const arr: Array<Obj> = JSON.parse(value)
        return arr.map((obj) => ({
            id: obj.id,
            name: obj.nombre,
            code: obj.codigo,
        }))
    })
    declare codes: Array<DTO.code>

    @Expose({ name: "unidades" })
    @Transform(({ value }) => {
        const arr: Array<Obj> = JSON.parse(value)
        return arr.map((obj) => ({
            id: obj.id,
            name: obj.nombre,
            profit: obj.ganancia,
            sale: obj.venta,
        }))
    })
    declare units: Array<DTO.unit>
}
