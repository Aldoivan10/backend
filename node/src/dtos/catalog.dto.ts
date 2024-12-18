import { Expose } from "class-transformer"

export class BaseDTO {
    @Expose({ name: "id" })
    id!: number

    @Expose({ name: "nombre" })
    name!: string
}
