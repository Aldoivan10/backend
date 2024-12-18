import { ClassConstructor, plainToClass } from "class-transformer"
import Repository from "../repositories/repository"
import { arrConj } from "../utils/array.util"
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

    protected insert(item: I, log: Repo.Log): O {
        return this.mapper(this.repo.insert(item, log))!
    }

    protected update(id: number, item: I, log: Repo.Log): Maybe<O> {
        return this.mapper(this.repo.update(id, item, log))
    }

    protected delete(ids: number[], log: Repo.Log) {
        return this.repo
            .delete(ids, log)
            .map(this.mapper.bind(this))
            .filter(notFalsy)
    }

    abstract add(body: I, username: string): O

    abstract edit(id: number, body: I, username: string): Maybe<O>

    abstract remove(ids: number[], username: string): O[]

    protected mapper(item: Maybe<Obj>) {
        return item ? plainToClass(this.dto, item) : null
    }

    protected getChange({ type, user, target, items }: ChangeArgs) {
        const change = target ? ` ${target}: ` : ":"
        const strArr = arrConj(items)
        switch (type) {
            case "add":
                return `<strong><span class="text-primary">${user}</span> <span class="text-success">creó</span>${change}</strong>${strArr}`
            case "upd":
                return `<strong><span class="text-primary">${user}</span> <span class="text-warning">modificó</span>${change}</strong>${strArr}`
            case "del":
                return `<strong><span class="text-primary">${user}</span> <span class="text-error">eliminó</span>${change}</strong>${strArr}`
            default:
                throw new Error("Invalid change type")
        }
    }
}
