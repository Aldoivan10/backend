import { Expose, Transform } from "class-transformer"

const transformProducts = ({ value }: DTO.TransformProduct) => {
    const products: DTO.KitProducts = JSON.parse(value)
    return products.map((product) => ({
        id: product.id,
        name: product.nombre,
        department: {
            id: product.departamento.id,
            name: product.departamento.nombre,
        },
        provider: { id: product.proveedor.id, name: product.proveedor.nombre },
        amount: product.cantidad,
        min: product.min,
        refundable: product.reembolsable,
        codes: product.codigos.map((code) => ({
            id: code.id,
            name: code.nombre,
            code: code.codigo,
        })),
        units: product.unidades.map((unit) => ({
            id: unit.id,
            name: unit.nombre,
            profit: unit.ganancia,
            sale: unit.venta,
            amount: unit.cantidad,
        })),
    }))
}

export class KitDTO {
    @Expose()
    declare id: number

    @Expose({ name: "nombre" })
    declare name: string

    @Expose({ name: "productos" })
    @Transform(transformProducts)
    declare products: Record<string, any>
}
