import { Exclude, Expose, Transform, Type } from "class-transformer"
import { IsString, Min } from "class-validator"

const transformShortcuts = (shortcuts: DTO.Shortcut[], view: 0 | 1) => {
    return shortcuts
        .filter((atajo) => atajo.vista === view)
        .map((atajo) => ({
            action: atajo.accion,
            shortcut: atajo.atajo,
        }))
}

class Shortcut {
    action!: string
    shortcut!: string
}

export class InitUser {
    @Expose({ name: "nombre" })
    declare name: string

    @Exclude()
    declare atajos: DTO.Shortcut[]

    @Expose() // Incluimos views como un atributo constante en la salida
    @Transform(({ obj }) => transformShortcuts(JSON.parse(obj.atajos), 1))
    declare views: Shortcut[]

    @Expose() // Incluimos shortcuts como un atributo constante en la salida
    @Transform(({ obj }) => transformShortcuts(JSON.parse(obj.atajos), 0))
    declare shortcuts: Shortcut[]
}

export class UserDTO {
    @Type(() => Number)
    @Expose()
    @Min(1)
    declare id: number

    @Expose({ name: "nombre" })
    @IsString()
    declare name: string

    @Expose()
    @Transform(({ obj }) => ({ id: obj.id_rol, name: obj.rol }))
    declare role: Record<string, any>

    @Expose({ groups: ["admin"] })
    @Transform((_) => false)
    declare logged: boolean

    @Expose({ groups: ["admin"] })
    @Transform(({ obj }) => obj.contrasenia, { toClassOnly: true })
    declare password?: string

    @Expose()
    get payload() {
        return {
            name: this.name,
            logged: this.logged,
            admin: this.role.id === 1,
        }
    }
}
