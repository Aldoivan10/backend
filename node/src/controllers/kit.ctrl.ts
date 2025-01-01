import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { KitDTO } from "../dtos/kit.dto"
import { KitService } from "../services/kit.svc"
import { KitSchema } from "../validations/kit.val"
import { Controller } from "./controller"

@injectable()
export class KitController extends Controller<
    typeof KitSchema,
    Body.Kit,
    KitDTO
> {
    protected readonly messages = {
        create: "Kit creado",
        update: "Kit actualizado",
        delete: "Kits eliminados",
    }

    constructor(@inject(Types.KitService) protected readonly svc: KitService) {
        super(["nombre"])
    }
}
