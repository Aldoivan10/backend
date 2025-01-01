import { Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { KitController } from "../controllers/kit.ctrl"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { IdsSchema } from "../validations/general.val"
import { KitSchema } from "../validations/kit.val"

const router = Router()
const controller = container.get<KitController>(Types.KitController)

router.get("/", controller.findAll.bind(controller))
router.get("/single", controller.find.bind(controller))
router.get("/:id(\\d+)", controller.findByID.bind(controller))
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(KitSchema),
    controller.create.bind(controller)
)
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(KitSchema),
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
