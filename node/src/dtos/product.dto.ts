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
    @Transform(({ value }) => JSON.parse(value))
    declare codes: Array<{ id: number; code: string }>

    @Expose({ name: "unidades" })
    @Transform(({ value }) => JSON.parse(value))
    declare units: Array<{ id: number; profit: number; gain: number }>
}
