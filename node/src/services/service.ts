import { ClassConstructor, plainToInstance } from "class-transformer"
import { FilterDomain } from "../domains/filter.domain"
import { Repository } from "../repositories/repository"
import { notFalsy } from "../utils/obj.util"

export interface IService<I extends Obj, O> {
    all(filter: FilterDomain, groups?: string[]): O[]

    getByID(id: number, groups?: string[]): Maybe<O>

    getByFilter(filter: FilterDomain, groups?: string[]): Maybe<O>

    add(body: I, username: string, groups?: string[]): O

    edit(id: number, body: I, username: string, groups?: string[]): Maybe<O>

    remove(ids: number[], username: string, groups?: string[]): O[]
}

export abstract class Service<I extends Obj, O> implements IService<I, O> {
    protected abstract repo: Repository<I>

    constructor(protected readonly dto: ClassConstructor<O>) {}

    public all(filter: FilterDomain, groups?: string[]) {
        return this.repo
            .all(filter.getData(), filter.getFilter())
            .map((item) => this.mapper(item, groups))
            .filter(notFalsy)
    }

    public getByID(id: number, groups?: string[]) {
        return this.mapper(this.repo.getByID(id), groups)
    }

    public getByFilter(filter: FilterDomain, groups?: string[]) {
        return this.mapper(
            this.repo.getByFilter(filter.getData(), filter.getFilter()),
            groups
        )
    }

    protected insert(item: I, user: string, groups?: string[]): O {
        return this.mapper(this.repo.insert(item, user), groups)!
    }

    protected update(
        id: number,
        item: I,
        user: string,
        groups?: string[]
    ): Maybe<O> {
        return this.mapper(this.repo.update(id, item, user), groups)
    }

    protected delete(
        ids: number[],
        user: string,
        desc: string,
        groups?: string[]
    ) {
        return this.repo
            .delete(ids, user, desc)
            .map((item) => this.mapper(item, groups))
            .filter(notFalsy)
    }

    abstract add(body: I, username: string, groups?: string[]): O

    abstract edit(
        id: number,
        body: I,
        username: string,
        groups?: string[]
    ): Maybe<O>

    abstract remove(ids: number[], username: string, groups?: string[]): O[]

    protected mapper(item: Maybe<Obj>, groups?: string[]) {
        if (!item) return null
        return plainToInstance(this.dto, item, {
            groups,
            excludeExtraneousValues: true,
        })
    }
}
