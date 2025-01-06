import { inject } from "inversify"
import { Types } from "../containers/types"
import { ParserDTO } from "../dtos/parser.dto"
import { ParserService } from "../services/parser.svc"
import { ParserSchema } from "../validations/parser.val"
import { Controller } from "./controller"

export class ParserController extends Controller<
    typeof ParserSchema,
    Body.Parser,
    ParserDTO
> {
    protected messages = {
        create: "Unidad de conversión creada",
        update: "Unidad de conversión editada",
        delete: "Unidades de conversión eliminadas",
    }

    constructor(
        @inject(Types.ParserService) protected readonly svc: ParserService
    ) {
        super(["unidad", "sub_unidad", "multiplicador"])
    }
}
