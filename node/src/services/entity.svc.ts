import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { EntityDTO } from "../dtos/entity.dto"
import { EntityRepository } from "../repositories/entity.repo"
import { arrConj } from "../utils/array.util"
import { notFalsy } from "../utils/obj.util"
import { Service } from "./service"

@injectable()
export class EntityService extends Service<Body.Entity, EntityDTO> {
    constructor(
        @inject(Types.EntityRepository)
        protected readonly repo: EntityRepository
    ) {
        super(EntityDTO)
    }

    public add(body: Body.Entity, username: string) {
        return super.insert(body, username)
    }

    public edit(id: number, body: Body.Entity, username: string) {
        return super.update(id, body, username)
    }

    public remove(ids: number[], username: string): EntityDTO[] {
        const names = ids
            .map((id) => this.getByID(id))
            .filter(notFalsy)
            .map((item) => item.name)
        return super.delete(ids, username, `Las entidades: ${arrConj(names)}`)
    }
}
