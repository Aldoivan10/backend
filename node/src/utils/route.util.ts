import { plainToClass } from "class-transformer"
import { Request } from "express"
import { FilterDomain } from "../domains/filter.domain"
import { FilterDto } from "../dtos/filter.dto"

export function getFilter(req: Request, columns: string[]) {
    const filterDTO = plainToClass(FilterDto, req.params, {
        excludeExtraneousValues: true,
    })
    return new FilterDomain(columns, filterDTO).build()
}
