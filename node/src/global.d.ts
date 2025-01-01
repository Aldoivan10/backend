import { BaseIssue, BaseSchema, InferOutput } from "valibot"
import { APIError } from "./models/error"

declare global {
    namespace Express {
        interface Locals {
            error?: APIError
        }

        interface Request {
            user: Maybe<TokenPayload>
            params: {
                id?: string
                filters?: string
                orders?: string
                limit?: string
                offset?: string
                table?: string
            }
            body: ReqBody
        }

        interface DeleteRequest extends Request {
            body: ReqBody & { ids: number[] }
        }

        interface BodyRequest<
            T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>
        > extends Express.Request {
            body: ReqBody & InferOutput<T>
        }
    }

    type ReqBody = Record<string, any> & { username: string }

    type Env = {
        PORT?: number
        HOST?: string
        PASS_SALT?: number
        TK_KEY?: string
        AT_TIME?: string
        RT_TIME?: string
        DB_PATH?: string
        TK_ALG?: string
        TK_OPT?: Obj
    }

    type Maybe<T> = T | undefined | null

    type ID = { id: number }

    type FilterData = Record<string, string | number>

    type Obj = Record<string, any>

    type TokenPayload = {
        id: number
        name: string
        admin: boolean
        logged: boolean
    }
}

export {}
