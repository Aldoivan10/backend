import { Expose, Transform } from "class-transformer"

export class EntityDTO {
    @Expose()
    declare id: number

    @Expose({ name: "nombre" })
    declare name: string

    @Expose()
    @Transform(({ obj }) => ({ id: +obj.id_tipo, name: obj.tipo }))
    declare type: Record<string, any>

    @Expose()
    declare rfc?: string

    @Expose({ name: "direccion" })
    declare address?: string

    @Expose({ name: "domicilio" })
    declare domicile?: string

    @Expose({ name: "codigo_postal" })
    declare postal_code?: string

    @Expose({ name: "telefono" })
    declare phone?: string

    @Expose({ name: "correo" })
    declare email?: string
}
