import { Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { ParserController } from "../controllers/parser.ctrl"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { IdsSchema } from "../validations/general.val"
import { ParserSchema } from "../validations/parser.val"

const router = Router()
const controller = container.get<ParserController>(Types.ParserController)

router.get("/", controller.findAll.bind(controller))
router.get("/single", controller.find.bind(controller))
router.get("/:id(\\d+)", controller.findByID.bind(controller))
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(ParserSchema),
    controller.create.bind(controller)
)
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(ParserSchema),
    controller.update.bind(controller)
)
router.delete(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(IdsSchema),
    controller.delete.bind(controller)
)

export default router
