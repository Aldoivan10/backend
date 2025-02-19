import { Expose, Transform, Type } from "class-transformer"
import { IsArray, IsNumber, IsOptional, IsString, Min } from "class-validator"

const transformFilterFn = ({ value }: DTO.Transform) => {
    if (!value) return undefined
    const regex = /[a-z0-9]+(_(gt|gte|lt|lte|eq|like)$)?/i
    const entries = value.split(",").map(str => str.split("=").map(s => s.trim())).filter(([key]) => regex.test(key))
    return Object.fromEntries(entries)
}

const transformOrderFn = ({ value }: DTO.Transform) => {
    if (!value) return undefined
    const regex = /[a-z0-9]+(_(asc|desc)$)?/i
    const arr: string[] = value.split(",")
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
