import { Expose, Transform, Type } from "class-transformer"
import { IsArray, IsNumber, IsOptional, IsString, Min } from "class-validator"

const transformFilterFn = ({ value }: DTO.TransformFilters) => {
    if (!value) return undefined
    const regex = /[a-z0-9]+(_(gt|gte|lt|lte|eq|like)$)?/i
    const obj = JSON.parse(value)
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([key]) => regex.test(key))
            .map(([key, val]) => [
                key,
                typeof val === "string" ? val : Number(val),
            ])
    )
}

const transformOrderFn = ({ value }: DTO.TransformOrders) => {
    if (!value) return undefined
    const regex = /[a-z0-9]+(_(asc|desc)$)?/i
    const arr: string[] = JSON.parse(value)
    return arr.filter((item) => regex.test(item))
}

export class FilterDto {
    @IsOptional()
    @IsString()
    @Expose()
    @Transform(transformFilterFn)
    filters?: Record<string, string | number>

    @Expose()
    @IsOptional()
    @IsArray()
    @Type(() => Array<string>)
    @Transform(transformOrderFn)
    orders?: string[]

    @Expose()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10

    @Expose()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0
}
