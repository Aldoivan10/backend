import { Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { EntityController } from "../controllers/entity.ctrl"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { EntitySchema } from "../validations/entity.val"
import { IdsSchema } from "../validations/general.val"

const router = Router()
const controller = container.get<EntityController>(Types.EntityController)

router.get("/", controller.findAll.bind(controller))
router.get("/single", controller.find.bind(controller))
router.get("/:id(\\d+)", controller.findByID.bind(controller))
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(EntitySchema),
    controller.create.bind(controller)
)
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(EntitySchema),
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
