import { ClassConstructor, plainToClass } from "class-transformer"
import { Repository } from "../repositories/repository"
import { notFalsy } from "../utils/obj.util"

export abstract class Service<I extends Record<string, any>, O> {
    protected abstract repo: Repository<I>

    constructor(protected readonly dto: ClassConstructor<O>) {}

    public all(data: FilterData, filter: string = "") {
        return this.repo
            .all(data, filter)
            .map(this.mapper.bind(this))
            .filter(notFalsy)
    }

    public getByID(id: number) {
        return this.mapper(this.repo.getByID(id))
    }

    protected insert(item: I, user: string): O {
        return this.mapper(this.repo.insert(item, user))!
    }

    protected update(id: number, item: I, user: string): Maybe<O> {
        return this.mapper(this.repo.update(id, item, user))
    }

    protected delete(ids: number[], user: string, desc: string) {
        return this.repo
            .delete(ids, user, desc)
            .map(this.mapper.bind(this))
            .filter(notFalsy)
    }

    abstract add(body: I, username: string): O

    abstract edit(id: number, body: I, username: string): Maybe<O>

    abstract remove(ids: number[], username: string): O[]

    protected mapper(item: Maybe<Obj>) {
        return item ? plainToClass(this.dto, item) : null
    }
}
