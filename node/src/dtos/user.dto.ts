import { Exclude, Expose, Transform, Type } from "class-transformer"
import { IsNotEmpty, IsString, Min } from "class-validator"

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
    @Type(() => String)
    @IsNotEmpty()
    @IsString()
    name!: string

    @Exclude()
    private atajos!: DTO.Shortcut[]

    @Expose() // Incluimos views como un atributo constante en la salida
    @Type(() => Shortcut)
    @Transform(({ obj }) => transformShortcuts(JSON.parse(obj.atajos), 1))
    views!: Shortcut[]

    @Expose() // Incluimos shortcuts como un atributo constante en la salida
    @Type(() => Shortcut)
    @Transform(({ obj }) => transformShortcuts(JSON.parse(obj.atajos), 0))
    shortcuts!: Shortcut[]
}

export class User {
    @Type(() => Number)
    @Min(1)
    id!: number

    @Expose({ name: "nombre" })
    @Type(() => String)
    @IsNotEmpty()
    @IsString()
    name!: string

    @Expose()
    @Type(() => String)
    @IsNotEmpty()
    @IsString()
    role!: string

    @Expose()
    @Type(() => Boolean)
    @Transform((_) => false)
    logged!: boolean

    @Expose({ name: "contrasenia" })
    password?: string

    @Expose()
    get payload() {
        return {
            name: this.name,
            role: this.role,
            logged: this.logged,
        }
    }
}
