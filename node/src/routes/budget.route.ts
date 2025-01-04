import { Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { BudgetController } from "../controllers/budget.ctrl"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { BudgetSchema } from "../validations/budget.val"
import { IdsSchema } from "../validations/general.val"

const router = Router()
const controller = container.get<BudgetController>(Types.BudgetController)

router.get("/", controller.findAll.bind(controller))
router.get("/single", controller.find.bind(controller))
router.get("/:id(\\d+)", controller.findByID.bind(controller))
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(BudgetSchema),
    controller.create.bind(controller)
)
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(BudgetSchema),
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
