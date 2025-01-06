import { Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { SaleControlller } from "../controllers/sale.ctrl"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { IdsSchema } from "../validations/general.val"
import { SaleSchema } from "../validations/sale.val"

const router = Router()
const controller = container.get<SaleControlller>(Types.SaleController)

router.get("/", controller.findAll.bind(controller))
router.get("/single", controller.find.bind(controller))
router.get("/:id(\\d+)", controller.findByID.bind(controller))
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(SaleSchema),
    controller.create.bind(controller)
)
router.delete(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(IdsSchema),
    controller.delete.bind(controller)
)

export default router
