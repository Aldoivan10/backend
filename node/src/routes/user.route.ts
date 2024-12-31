import { Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { UserController } from "../controllers/user.ctrl"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { IdsSchema } from "../validations/general.val"
import { ShortcutSchema } from "../validations/shortcut.val"
import { UserSchema } from "../validations/user.val"

const router = Router()
const controller = container.get<UserController>(Types.UserController)

router.get("/", controller.findAll.bind(controller))
router.get("/single", controller.find.bind(controller))
router.get("/:id(\\d+)", controller.findByID.bind(controller))
router.patch(
    "/shortcuts",
    tokenMW,
    validationMW(ShortcutSchema),
    controller.setShortcuts.bind(controller)
)
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(UserSchema),
    controller.create.bind(controller)
)
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(UserSchema),
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
