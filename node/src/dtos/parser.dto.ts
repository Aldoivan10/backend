import { Expose, Transform } from "class-transformer"

export class ParserDTO {
    @Expose()
    declare id: number

    @Expose()
    @Transform(({ obj }) => ({ id: obj.id_unidad, name: obj.unidad }))
    declare unit: DTO.Item

    @Expose()
    @Transform(({ obj }) => ({ id: obj.id_sub_unidad, name: obj.sub_unidad }))
    declare sub_unit: DTO.Item

    @Expose({ name: "multiplicador" })
    declare multiplier: number
}
