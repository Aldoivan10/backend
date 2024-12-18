import { Transform, Type } from "class-transformer"
import { IsArray, IsNumber, IsObject, IsOptional, Min } from "class-validator"

const transformFilterFn = ({ value }: DTO.TransformFilters) => {
    const regex = /[a-z0-9]+(_(gt|gte|lt|lte|eq|like)$)?/i
    return Object.fromEntries(
        Object.entries(value)
            .filter(([key]) => regex.test(key))
            .map(([key, val]) => [
                key,
                typeof val === "string" ? val : Number(val),
            ])
    )
}

const transformOrderFn = ({ value }: DTO.TransformOrders) => {
    const regex = /[a-z0-9]+(_(asc|desc)$)?/i
    return value.filter((item) => regex.test(item))
}

export class FilterDto {
    @IsOptional()
    @IsObject()
    @Type(() => Object)
    @Transform(transformFilterFn)
    filters?: Record<string, string | number>

    @IsOptional()
    @IsArray()
    @Type(() => Array<string>)
    @Transform(transformOrderFn)
    orders?: string[]

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0
}
