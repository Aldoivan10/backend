import { Expose, Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator"

export class CatalogDTO {
    @Expose()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    id!: number

    @Expose({ name: "name" })
    @Type(() => String)
    @IsNotEmpty()
    @IsString()
    nombre!: string
}
