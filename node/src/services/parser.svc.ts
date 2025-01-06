import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { ParserDTO } from "../dtos/parser.dto"
import { ParserRepository } from "../repositories/parser.repo"
import { arrConj } from "../utils/array.util"
import { notFalsy } from "../utils/obj.util"
import { Service } from "./service"

@injectable()
export class ParserService extends Service<Body.Parser, ParserDTO> {
    constructor(
        @inject(Types.ParserRepository)
        protected readonly repo: ParserRepository
    ) {
        super(ParserDTO)
    }

    add(body: Body.Parser, username: string): ParserDTO {
        return super.insert(body, username)
    }

    edit(id: number, body: Body.Parser, username: string): Maybe<ParserDTO> {
        return super.update(id, body, username)
    }

    remove(ids: number[], username: string): ParserDTO[] {
        const parsers = ids
            .map((id) => this.getByID(id))
            .filter(notFalsy)
            .map((item) => `${item.unit.name} -> ${item.sub_unit.name}`)
        return super.delete(
            ids,
            username,
            `Las unidades de conversión: ${arrConj(parsers)}`
        )
    }
}
