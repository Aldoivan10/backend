import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { EntityDTO } from "../dtos/entity.dto"
import { EntityService } from "../services/entity.svc"
import { EntitySchema } from "../validations/entity.val"
import { Controller } from "./controller"

@injectable()
export class EntityController extends Controller<
    typeof EntitySchema,
    Body.Entity,
    EntityDTO
> {
    protected readonly messages = {
        create: "Entidad creada",
        update: "Entidad actualizada",
        delete: "Entidades eliminadas",
    }

    constructor(
        @inject(Types.EntityService) protected readonly svc: EntityService
    ) {
        super([
            "nombre",
            "tipo",
            "id_tipo",
            "rfc",
            "dirección",
            "domicilio",
            "codigo_postal",
            "telefono",
            "correo",
        ])
    }
}
