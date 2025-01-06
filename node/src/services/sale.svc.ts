import { inject } from "inversify"
import { Types } from "../containers/types"
import { SaleDTO } from "../dtos/sale.dto"
import { SaleRepository } from "../repositories/sale.repo"
import { Service } from "./service"

export class SaleService extends Service<Body.Sale, SaleDTO> {
    constructor(
        @inject(Types.SaleRepository) protected readonly repo: SaleRepository
    ) {
        super(SaleDTO)
    }

    add(body: Body.Sale, username: string): SaleDTO {
        return super.insert(body, username)
    }

    edit(id: number, body: Body.Sale, username: string): Maybe<SaleDTO> {
        return super.update(id, body, username)
    }

    remove(ids: number[], username: string) {
        return super.delete(ids, username, "Las ventas")
    }
}
