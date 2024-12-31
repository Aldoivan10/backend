import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { EntityDTO } from "../dtos/entity.dto"
import { EntityRepository } from "../repositories/entity.repo"
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
        return super.delete(ids, username, "Las entidades")
    }
}
