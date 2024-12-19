declare namespace Repo {
    type Log = { user: string; desc: string }

    type Insert<I> = (input: I, log: Maybe<Log>) => Obj

    type Update<I> = (id: number, input: I, log: Maybe<Log>) => Obj

    type Change = [number, string]

    type Delete = (ids: number[], log: Maybe<Log>) => Array<Maybe<Obj>>

    type InitUser = { nombre: string; atajos: string }

    type TokenUser = { id: number; name: string; role: string; logged: boolean }
}
