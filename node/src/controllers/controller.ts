import { SqliteError } from "better-sqlite3"
import { plainToInstance } from "class-transformer"
import { NextFunction, Request, Response } from "express"
import { BaseIssue, BaseSchema } from "valibot"
import { FilterDomain } from "../domains/filter.domain"
import { FilterDto } from "../dtos/filter.dto"
import { DBError } from "../models/error"
import { IService } from "../services/service"

export interface IController<S extends BaseSchema<any, any, BaseIssue<any>>> {
    findAll(req: Request, res: Response, next: NextFunction): void

    find(req: Request, res: Response, next: NextFunction): void

    findByID(req: Request, res: Response, next: NextFunction): void

    create(req: Express.BodyRequest<S>, res: Response, next: NextFunction): void

    update(req: Express.BodyRequest<S>, res: Response, next: NextFunction): void

    delete(req: Express.DeleteRequest, res: Response, next: NextFunction): void

    total(req: Request, res: Response, next: NextFunction): void
}

export abstract class Controller<
    S extends BaseSchema<any, any, BaseIssue<any>>,
    I extends Obj,
    O extends Obj
> implements IController<S>
{
    protected abstract readonly svc: IService<I, O>
    protected declare abstract readonly messages: Ctrl.Messages

    constructor(protected readonly columns: string[]) {}

    public findAll(req: Request, res: Response, next: NextFunction): void {
        try {
            const filter = this.getFilter(req, this.columns)
            const items = this.svc.all(filter)
            res.json(items)
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }

    public find(req: Request, res: Response, next: NextFunction): void {
        try {
            const filter = this.getFilter(req, this.columns)
            const item = this.svc.get(filter)
            res.json(item)
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }

    public findByID(req: Request, res: Response, next: NextFunction): void {
        try {
            const id = +req.params.id
            const item = this.svc.getByID(id)
            res.json(item)
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }

    public create(
        req: Express.BodyRequest<S>,
        res: Response,
        next: NextFunction
    ): void {
        try {
            const user = req.user!
            const item = this.svc.add(req.body, user.name)
            res.status(201).json({
                message: this.messages.create,
                data: item,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.insert(err))
            else next(err)
        }
    }

    public update(
        req: Express.BodyRequest<S>,
        res: Response,
        next: NextFunction
    ): void {
        try {
            const id = +req.params.id!
            const user = req.user!
            const item = this.svc.edit(id, req.body, user.name)

            res.send({
                message: item ? this.messages.update : "No hubo modificaciones",
                data: item,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.update(err))
            else next(err)
        }
    }

    public delete(
        req: Express.DeleteRequest,
        res: Response,
        next: NextFunction
    ): void {
        try {
            const { ids } = req.body
            const user = req.user!
            const items = this.svc.remove(ids, user.name)
            res.send({ message: this.messages.delete, data: items })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }

    public total(req: Request, res: Response, next: NextFunction): void {
        try {
            const filter = this.getFilter(req, this.columns)
            const total = this.svc.total(filter)
            res.json(total)
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }

    protected getFilter(req: Request, columns: string[]) {
        const filterDTO = plainToInstance(FilterDto, req.query, {
            excludeExtraneousValues: true,
        })
        return new FilterDomain(columns, filterDTO).build()
    }
}
