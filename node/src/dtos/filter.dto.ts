import { Transform, Type } from "class-transformer"
import { IsArray, IsNumber, IsObject, IsOptional, Min } from "class-validator"

export class FilterDto {
    @IsOptional()
    @IsObject()
    @Type(() => Object)
    @Transform(
        ({ value }: { value: Record<string, string | number | boolean> }) =>
            Object.fromEntries(
                Object.entries(value).map(([key, val]) => [
                    key,
                    typeof val === "string" ? val : Number(val),
                ])
            ),
        { toClassOnly: true }
    )
    filters?: Record<string, string | number>

    @IsOptional()
    @IsArray()
    @Type(() => Array<string>)
    @Transform(({ value }: { value: string[] }) =>
        value.reduce((arr, item) => {
            const regex = /[a-z0-9]+(_(ASC|DESC)$)?/i
            if (regex.test(item)) arr.push(item)
            return arr
        }, [] as string[])
    )
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
